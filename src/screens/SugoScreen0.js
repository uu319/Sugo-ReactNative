/* @flow */

import React, { Component } from 'react';
import {
  View,
  SafeAreaView,
  Platform,
  ScrollView,
  Text,
  Dimensions,
  FlatList,
  Image,
  AsyncStorage,
} from 'react-native';
import * as firebase from 'firebase';
import _ from 'lodash';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Category from '../components/Category';
import PostListItems from '../components/SeekerPosts';
import { LOGO_URL } from '../constants/constants';

const { width } = Dimensions.get('window');
export default class Sugo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
    };
  }

  componentWillMount() {
    this.startHeaderHeight = 90;
    if (Platform.OS === 'android') {
      this.startHeaderHeight = getStatusBarHeight() + 70;
    }
    this.retrieveUserAsync()
      .then(user => {
        const { id } = user;
        this.retrievePosts(id);
      })
      .catch(console.log('error'));
  }

  retrieveUserAsync = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } catch (error) {
      console.log('error on user');
    }
    return null;
  };

  retrievePosts = id => {
    const database = firebase.database();
    database
      .ref('posts')
      .orderByChild(`seeker/id`)
      .equalTo(id)
      .on('value', snapshot => {
        const data = snapshot.val();
        this.setState({ data });
      });
  };

  renderPosts = post => {
    const { navigation } = this.props;
    return <PostListItems navigationProps={navigation} post={post.item} />;
  };

  render() {
    const { data } = this.state;
    const { navigation } = this.props;
    const posts = _.values(data);
    return (
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: this.startHeaderHeight,
              backgroundColor: 'white',
              borderBottomWidth: 1,
              borderBottomColor: '#dddddd',
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                alignSelf: 'center',
              }}
            >
              <Image
                source={{ uri: LOGO_URL }}
                style={{ width: 100, height: 100, resizeMode: 'cover' }}
              />
            </View>
          </View>
          <ScrollView scrollEventThrottle={16} style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', marginVertical: 10 }}>
                Tap to Sugo
              </Text>
              <View style={{ height: 130 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Category
                    imageUri={require('../myassets/sugo5.jpg')}
                    name="Household Chores"
                    navigationProps={navigation}
                  />
                  <Category
                    imageUri={require('../myassets/sugo4.jpg')}
                    name="Pickup/ Delivery"
                    navigationProps={navigation}
                  />
                  <Category
                    imageUri={require('../myassets/sugo3.jpg')}
                    name="Canvassing"
                    navigationProps={navigation}
                  />
                  <Category
                    imageUri={require('../myassets/sugo2.jpg')}
                    name="Claiming/ Filing Documents"
                    navigationProps={navigation}
                  />
                </ScrollView>
              </View>
              <View>
                <Text style={{ fontSize: 24, fontWeight: '700', marginVertical: 10 }}>
                  Your Sugo list
                </Text>
                <View style={{ width: width - 40 }}>
                  <FlatList
                    data={posts}
                    renderItem={this.renderPosts}
                    keyExtractor={(library, index) => index.toString()}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}
