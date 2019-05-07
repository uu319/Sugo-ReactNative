/* @flow */

import React, { Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Category from './Category';
// <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10 }}>Tap to Sugo</Text>
export default class Categories extends Component {
  render() {
    const { headerContainer, headerImageContainer, headerImageStyle } = styles;
    const { onCatPress } = this.props;
    return (
      <View style={{ flex: 1, marginHorizontal: 8 }}>
        <View style={headerContainer}>
          <View style={headerImageContainer}>
            <Image source={require('../myassets/sugoLogoOrange.png')} style={headerImageStyle} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/Grocery.png')}
              name="Grocery"
              onPress={() => onCatPress('Grocery')}
            />
            <Category
              imageUri={require('../myassets/Pickup.png')}
              name="Pickup/ Delivery"
              onPress={() => onCatPress('Pickup / Delivery')}
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/Document.png')}
              name="Filing/Claiming of Documents"
              onPress={() => onCatPress('Filing/Claiming of Documents')}
            />
            <Category
              imageUri={require('../myassets/Bills.png')}
              name="Bills Payment"
              onPress={() => onCatPress('Bills Payment')}
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/House.png')}
              name="Household Chores"
              onPress={() => onCatPress('Household Chores')}
            />
            <Category
              imageUri={require('../myassets/Others.png')}
              name="Others"
              onPress={() => onCatPress('Others')}
            />
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: getStatusBarHeight(),
  },
  headerContainer: {
    height: 70,
    backgroundColor: 'white',
  },
  headerImageContainer: {
    flex: 1,
    margin: 10,
  },
  headerImageStyle: {
    width: null,
    height: null,
    resizeMode: 'contain',
    flex: 1,
  },
});
