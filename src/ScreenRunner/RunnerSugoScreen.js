/* @flow */

import React, { Component } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Image, View, AsyncStorage } from 'react-native';
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
      posts: [],
      userInfo: '',
      currentPostStatus: 'loading',
      currentPost: null,
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
    const { id } = parsedUser;
    this.database.ref(`users/${id}`).on('value', async snapshot => {
      const userInfo = snapshot.val();
      const { currentPostStatus, currentPost } = userInfo;
      this.setState({ userInfo, currentPostStatus });
      if (currentPostStatus === 'accepted') {
        await AsyncStorage.setItem('currentPost', currentPost);
        this.listenPost(currentPost);
      }
    });
  };

  listenPost = currentPost => {
    this.database.ref(`posts/${currentPost}`).on('value', post => {
      this.setState({ currentPost: post.val() });
    });
  };

  renderSugoList = post => {
    const { userInfo } = this.state;
    return <SugoList post={post.item} userInfo={userInfo} />;
  };

  renderFlatList = () => {
    const { posts } = this.state;
    const { navigation } = this.props;
    return (
      <FlatList
        data={posts}
        renderItem={this.renderSugoList}
        navProp={navigation}
        keyExtractor={item => item.postId}
      />
    );
  };

  renderBody = () => {
    const { currentPostStatus, currentPost } = this.state;
    const { navigation } = this.props;
    if (currentPostStatus === 'loading') {
      return <Loading />;
    }
    if (currentPostStatus === 'none') {
      return this.renderFlatList();
    }
    return <CurrentSugo navProp={navigation} post={currentPost} />;
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
