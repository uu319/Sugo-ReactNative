/* @flow */

import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class PendingPost extends Component {
  render() {
    return (
      <View style={{ flex: 1, borderColor: 'black', borderWidth: 1 }}>
        <Text>Pending</Text>
      </View>
    );
  }
}
