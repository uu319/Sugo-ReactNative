/* @flow */

import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';

export default class PendingPost extends Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../myassets/pending.gif')}
          resizeMode="contain"
          style={{
            width: 60,
            height: 60,
          }}
        />
        <Text style={{ fontSize: 50 }}>Pending</Text>
      </View>
    );
  }
}
