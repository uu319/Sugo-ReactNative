import React from 'react';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Screen1 from '../ScreenRunner/Screen1';
import About from '../ScreenMutual/AboutScreen';
import Profile from '../ScreenMutual/ProfileScreen';

const RunnerTabNavigator = createAppContainer(
  createBottomTabNavigator(
    {
      Sugo: {
        screen: Screen1,
        navigationOptions: {
          tabBarLabel: 'SUGO',
          tabBarIcon: ({ tintColor }) => <Ionicons name="ios-search" color={tintColor} size={24} />,
        },
      },
      About: {
        screen: About,
        navigationOptions: {
          tabBarLabel: 'ABOUT',
          tabBarIcon: ({ tintColor }) => (
            <MaterialCommunityIcons name="information-outline" color={tintColor} size={24} />
          ),
        },
      },
      Profile: {
        screen: Profile,
        navigationOptions: {
          tabBarLabel: 'PROFILE',
          tabBarIcon: ({ tintColor }) => (
            <MaterialIcons name="person-outline" color={tintColor} size={24} />
          ),
        },
      },
    },
    {
      tabBarOptions: {
        activeTintColor: 'red',
        inactiveTintColor: 'gray',
        style: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          shadowOffset: { width: 5, height: 3 },
          shadowColor: 'black',
          shadowOpacity: 0.5,
          elevation: 5,
        },
      },
    },
  ),
);
export default RunnerTabNavigator;
