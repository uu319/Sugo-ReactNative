/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default class Category extends Component {
  onPress = () => {
    const { navigationProps, name, imageUri } = this.props;
    navigationProps.navigate('AddSugoScreen', { name, imageUri });
  };

  render() {
    const { imageUri, name } = this.props;
    return (
      <TouchableOpacity
        onPress={this.onPress}
        style={{
          height: 130,
          width: 130,
          marginLeft: 20,
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
