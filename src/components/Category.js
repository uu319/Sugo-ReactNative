/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default class Category extends Component {
  render() {
    const { imageUri, name, onPress } = this.props;
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          height: 100,
          width: 100,
          marginRight: 20,
          borderWidth: 0.5,
          borderColor: '#dddddd',
        }}
      >
        <View style={{ flex: 2 }}>
          <Image
            source={imageUri}
            style={{ flex: 1, width: null, height: null, resizeMode: 'cover' }}
          />
        </View>
        <View style={{ flex: 1, paddingLeft: 10, paddingTop: 10 }}>
          <Text>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
