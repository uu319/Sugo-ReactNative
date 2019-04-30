import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GLOBAL_STYLES } from '../constants/constants';

const Spinner = ({ size }) => {
  return (
    <View style={styles.spinnerStyle}>
      <ActivityIndicator size={size || 'large'} color={GLOBAL_STYLES.BRAND_COLOR} />
    </View>
  );
};
const styles = {
  spinnerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};
export { Spinner };
