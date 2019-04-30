/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, Image } from 'react-native';
import * as firebase from 'firebase';
import { GoogleSignIn } from 'expo';
import { Button } from '../components/common';
import { LOGO_URL, GLOBAL_STYLES } from '../components/constants/constants';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: '',
      postId: '',
      email: '',
      photoURL: '',
      displayName: '',
    };
  }

  componentWillMount() {
    this.retrieveInfoAsync();
  }

  retrieveInfoAsync = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      const { uid, email, photoURL, displayName } = parsedUser;
      const postId = await AsyncStorage.getItem('currentPost');
      this.setState({ postId, uid, email, photoURL, displayName });
    } catch (error) {
      console.log('error on user');
    }
  };

  // stop all listener before logout

  logout = async () => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    const { uid, postId } = this.state;
    try {
      await GoogleSignIn.signOutAsync();
      await firebase
        .database()
        .ref(`messages/${postId}`)
        .off();
      await firebase
        .database()
        .ref(`posts/${postId}`)
        .off();
      await firebase
        .database()
        .ref(`users/${uid}`)
        .off();
      await AsyncStorage.clear();
      navigate('AuthLoading');
    } catch (err) {
      console.log(`The error is: ${err}`);
    }
  };

  render() {
    const { email, photoURL, displayName } = this.state;
    const { img, nameStyle, emailStyle, btnStyle } = styles;
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoURL || LOGO_URL }} style={img} />
        <Text style={nameStyle}>{displayName}</Text>
        <Text style={emailStyle}>{email}</Text>
        <Button buttonStyle={btnStyle} onPress={this.logout}>
          Logout
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    height: 100,
    width: 100,
    borderColor: GLOBAL_STYLES.LIGHT_GREY_COLOR,
    borderWidth: 3,
    borderRadius: 50,
  },
  nameStyle: {
    fontSize: 24,
    fontWeight: '400',
    color: 'gray',
  },
  emailStyle: {
    fontSize: 18,
    color: 'gray',
  },
  btnStyle: {
    marginTop: 20,
  },
});
