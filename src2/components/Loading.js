/* @flow */

import React, { Component } from 'react';
import { View, Image } from 'react-native';

export default class Loading extends Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
