/* @flow */

import React, { Component } from 'react';
import { View } from 'react-native';
import Category from './Category';
// <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10 }}>Tap to Sugo</Text>
export default class Categories extends Component {
  render() {
    const { onCatPress } = this.props;
    return (
      <View style={{ flex: 1, marginHorizontal: 8 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/sugoGrocery.png')}
              name="Grocery"
              onPress={() => onCatPress('Grocery')}
            />
            <Category
              imageUri={require('../myassets/sugoDelivery.png')}
              name="Pickup/ Delivery"
              onPress={() => onCatPress('Pickup / Delivery')}
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/sugoDocuments.png')}
              name="Household Chores"
              onPress={() => onCatPress('Filing/Claiming of Documents')}
            />
            <Category
              imageUri={require('../myassets/sugoBillsPayment.png')}
              name="Pickup/ Delivery"
              onPress={() => onCatPress('Bills Payment')}
            />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Category
              imageUri={require('../myassets/sugoHousehold.png')}
              name="Household Chores"
              onPress={() => onCatPress('Household Chores')}
            />
            <Category
              imageUri={require('../myassets/sugoOthers.png')}
              name="Others"
              onPress={() => onCatPress('Others')}
            />
          </View>
        </View>
      </View>
    );
  }
}
