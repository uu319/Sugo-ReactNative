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
          marginHorizontal: 16,
          marginVertical: 15,
          borderWidth: 0.3,
          borderColor: '#ddd',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: 2 }}>
          <Image
            source={imageUri}
            resizeMode="contain"
            style={{
              flex: 1,
              width: null,
              height: null,
              backgroundColor: '#f39f33',
            }}
          />
        </View>
        <View
          style={{
            height: 48,
            paddingLeft: 10,
            justifyContent: 'flex-end',
            marginBottom: 10,
            backgroundColor: 'white',
          }}
        >
          <Text style={{ color: 'gray' }} adjustsFontSizeToFit numberOfLines={2}>
            {name}
          </Text>
          <Text style={{ color: 'gray' }} adjustsFontSizeToFit numberOfLines={2}>
            ₱300.00
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}
