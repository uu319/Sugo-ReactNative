import React, { Component } from 'react';
import { AsyncStorage, Image, View, Alert } from 'react-native';
import { GoogleSignIn, Constants } from 'expo';
import * as firebase from 'firebase';
import _ from 'lodash';
import { Button, Spinner } from '../components/common';

const isInClient = Constants.appOwnership === 'expo';
if (isInClient) {
  GoogleSignIn.allowInClient();
}

// const clientIdForUseInTheExpoClient =
//   '603386649315-vp4revvrcgrcjme51ebuhbkbspl048l9.apps.googleusercontent.com';
//
// const yourClientIdForUseInStandalone = Platform.select({
//   android: '157851373513-mj1d6fddp29k29tn2uiedpke4vhcth13.apps.googleusercontent.com',
//   ios: '93206224262-6vujqo0h2uiqg74necvl44lh51nor80d.apps.googleusercontent.com',
// });
//
// const clientId = isInClient ? clientIdForUseInTheExpoClient : yourClientIdForUseInStandalone;

class Login extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    GoogleSignIn.allowInClient();
    this.initAsync();
  }

  // : '93206224262-6vujqo0h2uiqg74necvl44lh51nor80d.apps.googleusercontent.com',
  initAsync = async () => {
    try {
      await GoogleSignIn.initAsync({
        isOfflineEnabled: true,
        isPromptEnabled: true,
        clientId: '93206224262-6vujqo0h2uiqg74necvl44lh51nor80d.apps.googleusercontent.com',
      });
    } catch ({ message }) {
      Alert.alert('initasync', message);
    }
  };

  signIn = async () => {
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      if (type === 'success') {
        Alert.alert(
          'user',
          JSON.stringify(user),
          // `${user.uid}, ${user.displayName}, ${user.lastName}, ${user.firstName}, ${user.photoURL}`,
        );
        this.setState({ loading: true });
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
      Alert.alert(`message:${message}`, `${message}`);
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

  // signIn = async () => {
  //   this.setState({ loading: true });
  //   try {
  //     const result = await Google.logInAsync(googleSigninConfig);
  //     if (result.type === 'success') {
  //       const { id } = result.user;
  //       this.database.ref(`users/${id}`).once('value', snapshot => {
  //         if (!snapshot.exists()) {
  //           this.storeUserToFirebase(result.user);
  //         }
  //         this.storeUserToLocalStorage(result.user);
  //       });
  //     } else {
  //       this.setState({ loading: false });
  //       console.log('cancelled');
  //     }
  //   } catch (e) {
  //     this.setState({ loading: false });
  //     Alert.alert('error on signIn');
  //   }
  // };

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
