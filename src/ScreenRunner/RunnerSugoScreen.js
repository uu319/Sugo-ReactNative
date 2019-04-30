/* @flow */

import React, { Component } from 'react';
import { StyleSheet, FlatList, SafeAreaView, AsyncStorage, View, Image } from 'react-native';
import * as firebase from 'firebase';
import _ from 'lodash';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SugoList from '../components/RunnerSugoItem';
import Loading from '../components/Loading';
import CurrentSugo from '../components/RunnerCurrentSugo';

export default class RunnerSugoScreen extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      posts: {},
      userInfo: '',
      currentPostStatus: 'loading',
      // currentPostObject: {},
    };
  }

  componentDidMount() {
    this.listenPosts();
    this.listenUser();
  }

  listenPosts = () => {
    this.database
      .ref(`posts`)
      .orderByChild('metadata/status')
      .equalTo('pending')
      .on('value', posts => {
        const postArray = _.values(posts.val());
        console.log('postsArray', postArray);
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
    return <SugoList post={post.item} userInfo={userInfo} />;
  };

  renderFlatList = () => {
    const { posts } = this.state;
    const { navigation } = this.props;
    const { headerContainer, headerImageStyle, headerImageContainer } = styles;
    return (
      <View syle={{ flex: 1 }}>
        <View style={headerContainer}>
          <View style={headerImageContainer}>
            <Image source={require('../myassets/sugoLogoOrange.png')} style={headerImageStyle} />
          </View>
        </View>
        <FlatList
          data={posts}
          renderItem={this.renderSugoList}
          navProp={navigation}
          keyExtractor={item => item.postId}
        />
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
    // return null;
    return <CurrentSugo navProp={navigation} post={currentPostObject} />;
  };

  render() {
    const { container } = styles;
    // console.log('posttttttt', this.state.currentPostObject);
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
