import React, { Component } from 'react';
import { AsyncStorage, Image, View, Alert } from 'react-native';
import { GoogleSignIn, Constants, Permissions, Notifications } from 'expo';
import * as firebase from 'firebase';
import _ from 'lodash';
import { Button, Spinner } from '../components/common';

const isInClient = Constants.appOwnership === 'expo';
if (isInClient) {
  GoogleSignIn.allowInClient();
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      loading: false,
      token: '',
    };
  }

  async componentDidMount() {
    GoogleSignIn.allowInClient();
    await this.getUserToken();
    this.initAsync();
  }

  getUserToken = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return '';
    }
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      this.setState({ token });
      // await this.database.ref(`users/${uid}/token`).set(token);
      // this.setState({ userToken: token });
    } catch (e) {
      console.log('error');
    }
    return '';
  };

  initAsync = async () => {
    try {
      await GoogleSignIn.initAsync({
        // scopes: ['profile', 'email'],
        // behavior: 'web',
        clientId: '93206224262-6vujqo0h2uiqg74necvl44lh51nor80d.apps.googleusercontent.com',
      });
    } catch ({ message }) {
      Alert.alert('Error', 'Something went wrong, please try again');
    }
  };

  signIn = async () => {
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      if (type === 'success') {
        const { uid } = user;
        this.database.ref(`users/${uid}`).once('value', snapshot => {
          if (!snapshot.exists()) {
            this.storeUserToFirebase(user);
          }
          this.storeUserToLocalStorage(user);
        });
      } else {
        this.setState({ loading: false });
        console.log('cancelled');
      }
    } catch ({ message }) {
      this.setState({ loading: false });
      Alert.alert('Error', 'Something went wrong, please try again');
      Alert.alert(
        'Error',
        'Please try again. Sorry for having this issue, SugoPH team will look into this as soon as possible.',
      );
      firebase
        .database()
        .ref('errors')
        .push(message);
    }
  };

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
    const { email, uid, firstName, lastName, displayName, photoURL } = user;
    const { token } = this.state;
    try {
      await this.database.ref(`users/${uid}`).set({
        userId: uid,
        email,
        firstName,
        lastName,
        photoURL,
        displayName,
        currentPost: '',
        currentPostStatus: 'none',
        token,
      });
    } catch (e) {
      Alert.alert('Error', 'Something went wrong, please try again');
      this.setState({ loading: false });
      firebase
        .database()
        .ref('errors')
        .push(e.message);
    }
  };

  storeUserToLocalStorage = async user => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      navigate('TypeLoading');
    } catch (e) {
      this.setState({ loading: false });
      Alert.alert('error on storeUserToFirebase');
      firebase
        .database()
        .ref('errors')
        .push(e.message);
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
