import React from 'react';
import * as firebase from 'firebase';
import MainStackNavigator from './src/navigators/MainStack';
import TabNavigator from './src/navigators/TabNav';
import { config } from './src/constants/constants';

firebase.initializeApp(config);

export default class App extends React.Component {
  render() {
    return <MainStackNavigator />;
  }
}
