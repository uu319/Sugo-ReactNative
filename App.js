import React from 'react';
import * as firebase from 'firebase';
import MainStackNavigator from './src/navigators/MainStack';
import { firebaseConfig } from './src/constants/constants';

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  render() {
    return <MainStackNavigator />;
  }
}
