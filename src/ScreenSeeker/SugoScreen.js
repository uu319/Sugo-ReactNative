import React, { Component } from 'react';
import { View, SafeAreaView, Platform, AsyncStorage, Image, StyleSheet } from 'react-native';
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
      currentPost: null,
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
  }

  // post listener

  listenPost = currentPost => {
    this.database.ref(`posts/${currentPost}`).on('value', post => {
      this.setState({ currentPost: post.val() });
    });
  };

  // user listener watch post if user status if accepted
  // store post id in local storage when user status is accepted

  listenUser = async () => {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    const { uid } = parsedUser;
    this.database.ref(`users/${uid}`).on('value', async snapshot => {
      const { currentPostStatus, currentPost } = snapshot.val();
      this.setState({ userInfo: snapshot.val(), uid, currentPostStatus });
      if (currentPostStatus === 'accepted') {
        await AsyncStorage.setItem('postId', currentPost);
        this.listenPost(currentPost);
      }
    });
  };

  // retrieve user id and then listen to it

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
    const { currentPostStatus, currentPost } = this.state;
    const { navigation } = this.props;
    if (currentPostStatus === 'loading') {
      return <Loading />;
    }
    if (currentPostStatus === 'none') {
      return <Categories onCatPress={this.onCatPress} />;
    }
    if (currentPostStatus === 'pending') {
      return <PendingPost />;
    }
    return <AcceptedPost post={currentPost} navProp={navigation} />;
  };

  render() {
    const { container, headerContainer, headerImageContainer, headerImageStyle } = styles;
    return (
      <SafeAreaView style={container}>
        <View style={headerContainer}>
          <View style={headerImageContainer}>
            <Image source={require('../myassets/sugoLogoOrange.png')} style={headerImageStyle} />
          </View>
        </View>
        {this.renderBody()}
      </SafeAreaView>
    );
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
