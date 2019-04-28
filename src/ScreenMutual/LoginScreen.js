import React, { Component } from 'react';
import { AsyncStorage, Image, View, Alert } from 'react-native';
import { Google } from 'expo';
import * as firebase from 'firebase';
import _ from 'lodash';
import { Button, Spinner } from '../components/common';
import { googleSigninConfig } from '../components/constants/constants';

class Login extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      loading: false,
    };
  }

  checkIfRunner = async email => {
    const emails = [];
    await this.database.ref('runners').once('value', snapshot => {
      if (snapshot) {
        _.map(_.values(snapshot.val()), snap => {
          if (snap) {
            emails.push(snap.email);
          }
        });
      }
    });
    return emails.indexOf(email) > -1;
  };

  storeUserToFirebase = async user => {
    const { email, id, familyName, givenName, name, photoUrl } = user;
    try {
      await this.database.ref(`users/${id}`).set({
        userId: id,
        email,
        familyName,
        givenName,
        name,
        photoUrl,
        currentPost: '',
        currentPostStatus: 'none',
      });
    } catch (e) {
      this.setState({ loading: false });
    }
  };

  storeUserToLocalStorage = async user => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      navigate('TypeLoading');
    } catch (error) {
      this.setState({ loading: false });
      Alert.alert('error on storeUserToFirebase');
    }
  };

  signIn = async () => {
    this.setState({ loading: true });
    try {
      const result = await Google.logInAsync(googleSigninConfig);
      if (result.type === 'success') {
        const { id } = result.user;
        this.database.ref(`users/${id}`).once('value', snapshot => {
          if (!snapshot.exists()) {
            this.storeUserToFirebase(result.user);
          }
          this.storeUserToLocalStorage(result.user);
        });
      } else {
        this.setState({ loading: false });
        console.log('cancelled');
      }
    } catch (e) {
      this.setState({ loading: false });
      Alert.alert('error on signIn');
    }
  };

  renderButton() {
    const { loading } = this.state;
    return loading ? (
      <Spinner size="large" />
    ) : (
      <View>
        <View style={{ marginBottom: 10 }}>
          <Button onPress={this.signIn}>Login Via Google</Button>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ width: 120, height: 120, alignSelf: 'center' }}>
          <Image
            resizeMode="contain"
            source={require('../myassets/sugoLogoOrange.png')}
            style={{ width: null, height: null, flex: 1 }}
          />
        </View>
        {this.renderButton()}
      </View>
    );
  }
}
export default Login;
