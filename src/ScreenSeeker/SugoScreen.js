import React, { Component } from 'react';
import { SafeAreaView, Platform, AsyncStorage, StyleSheet, BackAndroid } from 'react-native';
import * as firebase from 'firebase';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import PendingPost from '../components/SeekerPendingPost';
import AcceptedPost from '../components/SeekerAcceptedPost';
import Categories from '../components/Categories';
import Loading from '../components/Loading';

export default class Sugo extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      userInfo: '',
      currentPostStatus: 'loading',
      currentPostObject: {},
      currentPostId: '',
      uid: '',
    };
  }

  componentWillMount() {
    this.startHeaderHeight = 90;
    if (Platform.OS === 'android') {
      this.startHeaderHeight = getStatusBarHeight() + 70;
    }
  }

  componentDidMount() {
    this.listenUser();
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  listenPost = currentPost => {
    this.database.ref(`posts/${currentPost}`).on('value', post => {
      this.setState({ currentPostObject: post.val() });
    });
  };

  listenUser = async () => {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    const { uid } = parsedUser;
    this.database.ref(`users/${uid}`).on('value', async snapshot => {
      const { currentPostStatus, currentPost } = snapshot.val();
      this.setState({
        userInfo: snapshot.val(),
        uid,
        currentPostStatus,
        currentPostId: currentPost,
      });
      if (
        currentPostStatus === 'accepted' ||
        currentPostStatus === 'started' ||
        currentPostStatus === 'done'
      ) {
        await AsyncStorage.setItem('currentPost', currentPost);
        this.listenPost(currentPost);
      }
    });
  };

  onCatPress = catName => {
    const { imageUri, userInfo, uid } = this.state;
    const { displayName, email, photoURL } = userInfo;
    const { navigation } = this.props;
    const { navigate } = navigation;
    const params = {
      uid,
      photoURL,
      displayName,
      email,
      imageUri,
      catName,
    };
    navigate('AddPostScreen', {
      params,
    });
  };

  renderBody = () => {
    const { currentPostStatus, currentPostObject, currentPostId } = this.state;
    const { navigation } = this.props;
    if (currentPostStatus === 'loading') {
      return <Loading />;
    }
    if (currentPostStatus === 'none') {
      return <Categories onCatPress={this.onCatPress} />;
    }
    if (currentPostStatus === 'pending') {
      return <PendingPost postId={currentPostId} />;
    }
    return <AcceptedPost post={currentPostObject} navProp={navigation} />;
  };

  render() {
    const { container } = styles;
    return <SafeAreaView style={container}>{this.renderBody()}</SafeAreaView>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: getStatusBarHeight(),
  },
  headerContainer: {
    height: 70,
    backgroundColor: 'white',
  },
  headerImageContainer: {
    flex: 1,
    margin: 10,
  },
  headerImageStyle: {
    width: null,
    height: null,
    resizeMode: 'contain',
    flex: 1,
  },
});
