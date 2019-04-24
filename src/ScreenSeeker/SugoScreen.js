/* @flow */

import React, { Component } from 'react';
import { View, SafeAreaView, Platform, Text, AsyncStorage, Alert, Image } from 'react-native';
import * as firebase from 'firebase';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Category from '../components/Category';
import PendingPost from '../components/PendingPost';
import AcceptedPost from '../components/AcceptedPost';
import Loading from '../components/Loading';
import { LOGO_URL } from '../components/constants/constants';

export default class Sugo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: '',
      currentPostStatus: 'loading',
      post: null,
    };
  }

  componentWillMount() {
    this.startHeaderHeight = 90;
    if (Platform.OS === 'android') {
      this.startHeaderHeight = getStatusBarHeight() + 70;
    }
  }

  componentDidMount() {
    this.retrieveAndWatchUser();
  }

  // post listener

  watchPost = currentPost => {
    const database = firebase.database();
    database.ref(`posts/${currentPost}`).on('value', post => {
      console.log('post watched');
      this.setState({ post: post.val() }, this.setState({ currentPostStatus: 'accepted' }));
    });
  };

  // user listener watch post if user status if accepted
  // store post id in local storage when user status is accepted

  watchUser = id => {
    const database = firebase.database();
    database.ref(`users/${id}`).on('value', async snapshot => {
      const { currentPostStatus, currentPost } = snapshot.val();
      this.setState({ userInfo: snapshot.val(), id, currentPostStatus });
      if (currentPostStatus === 'accepted') {
        await AsyncStorage.setItem('postId', currentPost);
        this.watchPost(currentPost);
      }
    });
  };

  // retrieve user id and then listen to it

  retrieveAndWatchUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      const { id } = parsedUser;
      this.watchUser(id);
    } catch (error) {
      Alert.alert('error on user');
    }
  };

  onCatPress = catName => {
    const { currentPostStatus } = this.state;
    const { imageUri, userInfo, id } = this.state;
    const { name, email, photoUrl } = userInfo;
    const { navigation } = this.props;
    const { navigate } = navigation;
    if (currentPostStatus === 'none') {
      const params = {
        id,
        photoUrl,
        name,
        email,
        imageUri,
        catName,
      };
      navigate('AddPostScreen', {
        params,
      });
    } else {
      Alert.alert('Alert Title', 'My Alert Msg', [{ text: 'OK' }], { cancelable: false });
    }
  };

  renderBody = () => {
    const { currentPostStatus, post } = this.state;
    if (currentPostStatus === 'loading') {
      return <Loading />;
    }
    if (currentPostStatus === 'none') {
      return this.renderCategories();
    }
    if (currentPostStatus === 'pending') {
      return <PendingPost />;
    }
    return <AcceptedPost post={post} />;
  };

  renderCategories() {
    const { navigation } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10 }}>Tap to Sugo</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/sugo5.jpg')}
              name="Household Chores"
              navigationProps={navigation}
              onPress={() => this.onCatPress('Household Chores', require('../myassets/sugo5.jpg'))}
            />
            <Category
              imageUri={require('../myassets/sugo4.jpg')}
              name="Pickup/ Delivery"
              navigationProps={navigation}
              onPress={() => this.onCatPress('Pickup / Delivery', require('../myassets/sugo4.jpg'))}
            />
            <Category
              imageUri={require('../myassets/sugo2.jpg')}
              name="Claiming/ Filing Documents"
              navigationProps={navigation}
              onPress={() =>
                this.onCatPress(' Filing / Claiming Documents', require('../myassets/sugo2.jpg'))
              }
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/sugo5.jpg')}
              name="Household Chores"
              navigationProps={navigation}
              onPress={() => this.onCatPress('Household Chores', require('../myassets/sugo5.jpg'))}
            />
            <Category
              imageUri={require('../myassets/sugo4.jpg')}
              name="Pickup/ Delivery"
              navigationProps={navigation}
              onPress={() => this.onCatPress('Pickup / Delivery', require('../myassets/sugo4.jpg'))}
            />
            <Category
              imageUri={require('../myassets/sugo3.jpg')}
              name="Canvassing"
              navigationProps={navigation}
              onPress={() => this.onCatPress('Canvassing', require('../myassets/sugo3.jpg'))}
            />
          </View>
        </View>
      </View>
    );
  }

  // <View style={{ flex: 1 }}>
  //   <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10 }}>Tap to Sugo</Text>
  //   <View style={{ height: 100, marginBottom: 20 }}>
  //     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  //       <Category
  //         imageUri={require('../myassets/sugo5.jpg')}
  //         name="Household Chores"
  //         navigationProps={navigation}
  //         onPress={() => this.onCatPress('Household Chores', require('../myassets/sugo5.jpg'))}
  //       />
  //       <Category
  //         imageUri={require('../myassets/sugo4.jpg')}
  //         name="Pickup/ Delivery"
  //         navigationProps={navigation}
  //         onPress={() => this.onCatPress('Pickup / Delivery', require('../myassets/sugo4.jpg'))}
  //       />
  //       <Category
  //         imageUri={require('../myassets/sugo3.jpg')}
  //         name="Canvassing"
  //         navigationProps={navigation}
  //         onPress={() => this.onCatPress('Canvassing', require('../myassets/sugo3.jpg'))}
  //       />
  //       <Category
  //         imageUri={require('../myassets/sugo2.jpg')}
  //         name="Claiming/ Filing Documents"
  //         navigationProps={navigation}
  //         onPress={() =>
  //           this.onCatPress(' Filing / Claiming Documents', require('../myassets/sugo2.jpg'))
  //         }
  //       />
  //     </ScrollView>
  //   </View>
  // </View>

  render() {
    return (
      <SafeAreaView style={{ flex: 1, marginHorizontal: 8, marginTop: getStatusBarHeight() }}>
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
        {this.renderBody()}
      </SafeAreaView>
    );
  }
}
