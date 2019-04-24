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
          flex: 1,
          marginHorizontal: 3,
          marginVertical: 10,
          borderWidth: 0.3,
          borderColor: '#dddddd',
          elevation: 3,
          shadowColor: 'gray',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.5,
        }}
      >
        <View style={{ flex: 2 }}>
          <Image
            source={imageUri}
            style={{ flex: 1, width: null, height: null, resizeMode: 'cover' }}
          />
        </View>
        <View
          style={{
            height: 48,
            paddingLeft: 10,
            justifyContent: 'flex-end',
            marginBottom: 10,
          }}
        >
          <Text>{name}</Text>
          <Text>₱100.00</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
