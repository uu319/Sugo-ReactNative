/* @flow */

import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class Loading extends Component {
  render() {
    return (
      <View style={{ flex: 1, borderColor: 'black', borderWidth: 1 }}>
        <Text>Loading</Text>
      </View>
    );
  }
}
