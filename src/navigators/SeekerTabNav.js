import React from 'react';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Sugo from '../ScreenSeeker/SeekerSugoScreen';
import Profile from '../ScreenMutual/ProfileScreen';

const SeekerTabNavigator = createAppContainer(
  createBottomTabNavigator(
    {
      Sugo: {
        screen: Sugo,
        navigationOptions: {
          tabBarLabel: 'SUGO',
          tabBarIcon: ({ tintColor }) => <Ionicons name="ios-search" color={tintColor} size={21} />,
        },
      },
      // About: {
      //   screen: About,
      //   navigationOptions: {
      //     tabBarLabel: 'ABOUT',
      //     tabBarIcon: ({ tintColor }) => (
      //       <MaterialCommunityIcons name="information-outline" color={tintColor} size={21} />
      //     ),
      //   },
      // },
      Profile: {
        screen: Profile,
        navigationOptions: {
          tabBarLabel: 'PROFILE',
          tabBarIcon: ({ tintColor }) => (
            <MaterialIcons name="person-outline" color={tintColor} size={21} />
          ),
        },
      },
    },
    {
      tabBarOptions: {
        activeTintColor: '#f39f33',
        inactiveTintColor: 'gray',
        labelStyle: {
          fontSize: 11,
        },
        style: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          shadowOffset: { width: 5, height: 3 },
          shadowColor: 'black',
          shadowOpacity: 0.5,
          elevation: 5,
          paddingVertical: 5,
        },
      },
    },
  ),
);
export default SeekerTabNavigator;
