/* @flow */

import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  AsyncStorage,
  BackHandler,
  View,
  Image,
  Text,
} from 'react-native';
import * as firebase from 'firebase';
import _ from 'lodash';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SugoItem from '../components/RunnerSugoItem';
import Loading from '../components/Loading';
import CurrentSugo from '../components/RunnerAcceptedPost';

export default class RunnerSugoScreen extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      posts: [],
      userInfo: '',
      currentPostStatus: 'loading',
      currentPostObject: {},
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    this.listenPosts();
    this.listenUser();
  }

  onBackButtonPressAndroid = () => {
    return true;
  };

  listenPosts = () => {
    this.database
      .ref(`posts`)
      .orderByChild('metadata/status')
      .equalTo('pending')
      .on('value', posts => {
        const postArray = _.values(posts.val());
        this.setState({ posts: postArray });
      });
  };

  listenUser = async () => {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    const { uid } = parsedUser;
    this.database.ref(`users/${uid}`).on('value', async snapshot => {
      const userInfo = snapshot.val();
      const { currentPostStatus, currentPost } = userInfo;
      this.setState({ userInfo, currentPostStatus });
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

  renderSugoList = post => {
    const { userInfo } = this.state;
    return <SugoItem post={post.item} userInfo={userInfo} />;
  };

  renderFlatList = () => {
    const { posts } = this.state;
    const { navigation } = this.props;
    const { headerContainer, headerImageStyle, headerImageContainer } = styles;
    return (
      <View style={{ flex: 1 }}>
        <View style={headerContainer}>
          <View style={headerImageContainer}>
            <Image source={require('../myassets/sugoLogoOrange.png')} style={headerImageStyle} />
          </View>
        </View>
        {posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={this.renderSugoList}
            navProp={navigation}
            keyExtractor={item => item.postId}
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('../myassets/EmptyIcon.png')}
              style={{ height: 100, width: 100 }}
            />
            <Text style={{ fontSize: 30, color: '#dddddd' }}>Empty</Text>
          </View>
        )}
      </View>
    );
  };

  renderBody = () => {
    const { currentPostStatus, currentPostObject } = this.state;
    const { navigation } = this.props;
    if (currentPostStatus === 'loading') {
      return <Loading />;
    }
    if (currentPostStatus === 'none') {
      return this.renderFlatList();
    }
    return <CurrentSugo navProp={navigation} post={currentPostObject} />;
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
