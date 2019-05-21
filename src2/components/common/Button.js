import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { GLOBAL_STYLES } from '../Constants';

const Button = props => {
  const { buttonStyles, textStyles } = styles;
  const { onPress, children, buttonStyle, textStyle } = props;
  return (
    <TouchableOpacity style={[buttonStyles, buttonStyle]} onPress={onPress}>
      <Text style={[textStyles, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};
const styles = {
  buttonStyles: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GLOBAL_STYLES.BRAND_COLOR,
    marginLeft: 40,
    marginRight: 40,
  },
  textStyles: {
    alignSelf: 'center',
    color: GLOBAL_STYLES.BRAND_COLOR,
    fontSize: 20,
    fontWeight: '600',
    paddingTop: 10,
    paddingBottom: 10,
  },
};
export { Button };
