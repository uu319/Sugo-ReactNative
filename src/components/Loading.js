/* @flow */

import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default class Loading extends Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f3d352" />
        <Text>Please wait</Text>
      </View>
    );
  }
}
