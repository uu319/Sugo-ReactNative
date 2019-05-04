import React, { Component } from 'react';
import { Text, TouchableHighlight, View, StyleSheet, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

export default class MyModal extends Component {
  render() {
    const { container, modalCloseStyle, scrollViewStyle, titleTextStyle, descTextStyle } = styles;
    const { title, desc, isVisible, hideModal } = this.props;
    return (
      <Modal onBackButtonPress={() => hideModal} isVisible={isVisible} style={{ margin: 0 }}>
        <View style={container}>
          <TouchableHighlight style={modalCloseStyle} onPress={hideModal}>
            <Ionicons name="md-close-circle-outline" size={28} color="black" />
          </TouchableHighlight>
          <ScrollView style={scrollViewStyle}>
            <Text style={titleTextStyle}>{title}</Text>
            <Text style={descTextStyle}>{desc}</Text>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddddd',
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalCloseStyle: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 10,
  },
  scrollViewStyle: {
    margin: 10,
    flex: 1,
  },
  titleTextStyle: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 20,
  },
  descTextStyle: {
    fontSize: 20,
  },
});
