import React from 'react';
import { AsyncStorage, View, Image } from 'react-native';
import _ from 'lodash';
import * as firebase from 'firebase';

export default class TypeLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
    this.database = firebase.database();
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

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    const userToken = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(userToken);
    const { email } = parsedUser;
    this.checkIfRunner(email).then(async response => {
      if (response) {
        await AsyncStorage.setItem('type', 'runner');
        navigate('RunnerTabNavigator');
      } else {
        navigate('SeekerTabNavigator');
        await AsyncStorage.setItem('type', 'seeker');
      }
    });
    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../myassets/loading.gif')}
          resizeMode="contain"
          style={{
            width: 60,
            height: 60,
          }}
        />
      </View>
    );
  }
}
