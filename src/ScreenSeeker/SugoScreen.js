import React, { Component } from 'react';
import { SafeAreaView, Platform, AsyncStorage, StyleSheet, BackHandler, Alert } from 'react-native';
import { Notifications } from 'expo';
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
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    // this._notificationSubscription = Notifications.addListener(this._handleNotification);
    this.listenUser();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  // _handleNotification = notification => {
  //
  // };

  onBackButtonPressAndroid = () => {
    return true;
  };

  listenUser = async () => {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    const { uid } = parsedUser;
    this.database.ref(`users/${uid}`).on('value', async snapshot => {
      const { currentPostStatus, currentPost, token } = snapshot.val();
      this.setState({
        userInfo: snapshot.val(),
        uid,
        currentPostStatus,
        currentPostId: currentPost,
        token,
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

  listenPost = currentPost => {
    this.database.ref(`posts/${currentPost}`).on('value', post => {
      this.setState({ currentPostObject: post.val() });
    });
  };

  onCatPress = catName => {
    const { imageUri, userInfo, uid, token } = this.state;
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
      token,
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
