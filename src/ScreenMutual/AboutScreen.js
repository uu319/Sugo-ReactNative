import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class About extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Im the About component</Text>
      </View>
    );
  }
}

/* "googleSignIn": {
  "certificateHash": "DB:76:5C:A4:3C:2C:B7:BE:D4:2D:7B:72:EF:26:9F:AA:F1:53:F8:24",
} */

/* "permissions": [
  "ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION"
], */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
