/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, Image } from 'react-native';
import { Button } from '../components/common';
import { LOGO_URL, GLOBAL_STYLES } from '../constants/constants';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      photoUrl: '',
      name: '',
    };
  }

  componentWillMount() {
    this.retrieveUserAsync()
      .then(user => {
        console.log('the user in async', user);
        const { email, photoUrl, name } = user;
        this.setState({ email, photoUrl, name });
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

  logout = async () => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    try {
      await AsyncStorage.clear();
      navigate('LoginScreen');
    } catch (err) {
      console.log(`The error is: ${err}`);
    }
  };

  render() {
    const { email, photoUrl, name } = this.state;
    const { img, nameStyle, emailStyle, btnStyle } = styles;
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUrl || LOGO_URL }} style={img} />
        <Text style={nameStyle}>{name}</Text>
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
