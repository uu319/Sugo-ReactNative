import React, { Component } from 'react';
import { AsyncStorage, Image, View, Alert } from 'react-native';
import { Google } from 'expo';
import * as firebase from 'firebase';
import _ from 'lodash';
import { Button, Spinner } from '../components/common';
import { GLOBAL_STYLES, LOGO_URL, googleSigninConfig } from '../components/constants/constants';

class Login extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.checkIfLoggedIn();
  }

  checkIfLoggedIn = async () => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      const { email } = parsedUser;
      this.checkIfRunner(email).then(response => {
        const navigateTo = response ? 'RunnerTabNavigator' : 'SeekerTabNavigator';
        this.setState({ loading: false });
        navigate(navigateTo);
      });
    } catch (error) {
      this.setState({ loading: false });
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
    const { email, id, familyName, givenName, name, photoUrl } = user;
    try {
      await this.database.ref(`users/${id}`).set({
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
    const { email } = user;
    const { navigation } = this.props;
    const { navigate } = navigation;
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      this.checkIfRunner(email).then(response => {
        const navigateTo = response ? 'RunnerTabNavigator' : 'SeekerTabNavigator';
        navigate(navigateTo);
      });
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
