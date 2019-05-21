/* @flow */

import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { GLOBAL_STYLES } from '../Constants';

class Fab extends Component {
  render() {
    const { fab } = styles;
    const { children, onPress, styleProp } = this.props;
    return (
      <TouchableOpacity onPress={onPress} style={[fab, styleProp]}>
        <View>{children}</View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    left: 15,
    top: 20,
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
    borderRadius: 30,
    elevation: 8,
  },
});
export { Fab };
