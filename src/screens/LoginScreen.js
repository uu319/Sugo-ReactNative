import React, { Component } from 'react';
import { AsyncStorage, Image, View, Alert } from 'react-native';
import { Google } from 'expo';
import * as firebase from 'firebase';
import { Button, Spinner } from '../components/common';
import { GLOBAL_STYLES, LOGO_URL } from '../components/constants/constants';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    const { navigation } = this.props;
    const { navigate } = navigation;
    this.checkIfLoggedIn()
      .then(user => {
        if (user) {
          navigate('TabNavigator');
          this.setState({ loading: false });
        } else {
          this.setState({ loading: false });
        }
      })
      .catch();
  }

  checkIfLoggedIn = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user;
    } catch (error) {
      console.log('error on user');
    }
    return null;
  };

  signIn = async () => {
    this.setState({ loading: true });
    try {
      const result = await Google.logInAsync({
        behavior: 'web',
        androidClientId: '544798728580-fajrupu1o0rnf3g94d2dvpo30g4qgv82.apps.googleusercontent.com',
        iosClientId: '544798728580-5hqsqqrnsogmef7j99b5jubcgb0m1d24.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
      if (result.type === 'success') {
        const { navigation } = this.props;
        const { navigate } = navigation;
        console.log('this is the user', result.user);
        const { email, id, familyName, givenName, name, photoUrl } = result.user;
        const database = firebase.database();
        database
          .ref(`users/${id}`)
          .set({
            email,
            familyName,
            givenName,
            name,
            photoUrl,
          })
          .then(
            this.storeUser(result.user)
              .then(navigate('TabNavigator'))
              .catch(err => console.log(err)),
          )
          .catch(error => Alert.alert(error));
      } else {
        this.setState({ loading: false });
        console.log('cancelled');
      }
    } catch (e) {
      this.setState({ loading: false });
      console.log('error', e);
    }
  };

  storeUser = async user => {
    try {
      const prom = await AsyncStorage.setItem('user', JSON.stringify(user));
      return prom;
    } catch (error) {
      console.log(error);
    }
    return null;
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
        <Button
          onPress={() => this.signIn}
          buttonStyle={{ backgroundColor: GLOBAL_STYLES.BRAND_COLOR }}
          textStyle={{ color: '#ffffff' }}
        >
          Login as admin
        </Button>
      </View>
    );
  }

  render() {
    return (
      <View style={{ marginTop: 100 }}>
        <Image
          source={{
            uri: LOGO_URL,
          }}
          style={{ width: 200, height: 200, alignSelf: 'center' }}
        />
        <View style={{ height: 100 }} />
        {this.renderButton()}
      </View>
    );
  }
}
export default Login;
