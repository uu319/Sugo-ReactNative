import React from 'react';
import { View } from 'react-native';

const Card = props => {
  const { children, styleProp } = props;
  return <View style={[styles.containerStyle, styleProp]}>{children}</View>;
};
const styles = {
  containerStyle: {
    flex: 1,
  },
};
export { Card };
