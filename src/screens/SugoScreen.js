/* @flow */

import React, { Component } from 'react';
import { View, SafeAreaView, Platform, ScrollView, Text, AsyncStorage, Alert } from 'react-native';
import * as firebase from 'firebase';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Category from '../components/Category';
import MyModal from './Modal';
import EmptyPost from '../components/EmptyPost';
import PendingPost from '../components/PendingPost';
import AcceptedPost from '../components/AcceptedPost';
import Loading from '../components/Loading';

export default class Sugo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: '',
      currentPostStatus: 'loading',
      isModalVisible: false,
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
    this.retrieveUserAsync()
      .then(user => {
        const { id } = user;
        const database = firebase.database();
        database.ref(`users/${id}`).on('value', snapshot => {
          const { currentPostStatus, currentPost } = snapshot.val();
          this.setState({ userInfo: snapshot.val(), id, currentPostStatus, isModalVisible: false });
          if (currentPostStatus === 'accepted') {
            database.ref(`posts/${currentPost}`).on('value', post => {
              console.log('post from sugoscreen', post);
              this.setState({ post: post.val() }, this.setState({ currentPostStatus: 'accepted' }));
            });
          }
        });
      })
      .catch(console.log('error on componentDidMount'));
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

  onCatPress = (catName, imageUri) => {
    const { currentPostStatus } = this.state;
    if (currentPostStatus === 'none') {
      this.setState({ isModalVisible: true, catName, imageUri });
    } else {
      Alert.alert(
        'Alert Title',
        'My Alert Msg',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    }
  };

  onModalClose = () => {
    this.setState({ isModalVisible: false });
  };

  renderBody = () => {
    const { currentPostStatus, post } = this.state;
    if (currentPostStatus === 'loading') {
      return <Loading />;
    }
    if (currentPostStatus === 'none') {
      return <EmptyPost />;
    }
    if (currentPostStatus === 'pending') {
      return <PendingPost />;
    }
    return <AcceptedPost post={post} />;
  };

  renderCategories() {
    const { currentPostStatus } = this.state;
    const { navigation } = this.props;
    return currentPostStatus === 'none' ? (
      <View>
        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10 }}>Tap to Sugo</Text>
        <View style={{ height: 100, marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              onPress={() => this.onCatPress('Pickup ? Delivery', require('../myassets/sugo4.jpg'))}
            />
            <Category
              imageUri={require('../myassets/sugo3.jpg')}
              name="Canvassing"
              navigationProps={navigation}
              onPress={() => this.onCatPress('Canvassing', require('../myassets/sugo3.jpg'))}
            />
            <Category
              imageUri={require('../myassets/sugo2.jpg')}
              name="Claiming/ Filing Documents"
              navigationProps={navigation}
              onPress={() =>
                this.onCatPress(' Filing / Claiming Documents', require('../myassets/sugo2.jpg'))
              }
            />
          </ScrollView>
        </View>
      </View>
    ) : null;
  }

  // <View
  //   style={{
  //     height: this.startHeaderHeight,
  //     backgroundColor: 'white',
  //     borderBottomWidth: 1,
  //     borderBottomColor: '#dddddd',
  //   }}
  // >
  //   <View
  //     style={{
  //       backgroundColor: 'white',
  //       alignSelf: 'center',
  //     }}
  //   >
  //     <Image
  //       source={{ uri: LOGO_URL }}
  //       style={{ width: 100, height: 100, resizeMode: 'cover' }}
  //     />
  //   </View>
  // </View>

  render() {
    const { isModalVisible, catName, imageUri, userInfo, id } = this.state;
    const { name, email, photoUrl } = userInfo;
    return (
      <SafeAreaView style={{ flex: 1, marginHorizontal: 8 }}>
        <MyModal
          id={id}
          photoUrl={photoUrl}
          name={name}
          email={email}
          imageUri={imageUri}
          catName={catName}
          isModalVisible={isModalVisible}
          modalClose={this.onModalClose}
        />
        <View style={{ backgroundColor: 'white' }}>{this.renderCategories()}</View>
        {this.renderBody()}
      </SafeAreaView>
    );
  }
}
