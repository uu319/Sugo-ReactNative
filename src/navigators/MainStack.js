import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Login from '../screens/LoginScreen';
import TabNavigator from './TabNav';
import AddSugo from '../screens/AddSugoScreen';
import ViewSugo from '../screens/ViewSugoScreen';

const MainStackNavigator = createAppContainer(
  createStackNavigator(
    {
      LoginScreen: {
        screen: Login,
        navigationOptions: {
          header: null,
        },
      },
      TabNavigator: {
        screen: TabNavigator,
        navigationOptions: {
          header: null,
        },
      },
      ViewSugoScreen: {
        screen: ViewSugo,
        navigationOptions: {
          headerStyle: {
            borderBottomColor: 'white',
            borderBottomWidth: 0,
            shadowOffset: { height: 0, width: 0 },
            elevation: 0,
            shadowRadius: 0,
            shadowOpacity: 0,
            backgroundColor: 'transparent',
          },
        },
      },
      AddSugoScreen: {
        screen: AddSugo,
        navigationOptions: {
          headerStyle: {
            borderBottomColor: 'white',
            borderBottomWidth: 0,
            shadowOffset: { height: 0, width: 0 },
            elevation: 0,
            shadowRadius: 0,
            shadowOpacity: 0,
            backgroundColor: 'transparent',
          },
        },
      },
    },
    {
      navigationOptions: {
        gestureEnabled: false,
      },
    },
  ),
);
export default MainStackNavigator;
