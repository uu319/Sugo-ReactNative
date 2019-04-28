import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { GLOBAL_STYLES } from './constants/constants';

export default class MyModal extends Component {
  render() {
    const {
      container,
      scrollViewStyle,
      headerContainerStyle,
      profileContainerStyle,
      detailsContainerStyle,
      footerContainerStyle,
      imageContainerStyle,
      nameContainerStyle,
      imgStyle,
      nameTextStyle,
      sugoTextStyle,
      detailsTextStyle,
      priceContainerStyle,
      btnContainerStyle,
      priceTextStyle,
      btnAcceptStyle,
    } = styles;
    const { post, hideModal, isVisible, onAcceptSugo } = this.props;
    const { metadata, seeker } = post;
    const { name, photoUrl } = seeker;
    const { title, desc, price } = metadata;
    return (
      <Modal animationOut="slideOutLeft" isVisible={isVisible} style={{ margin: 0 }}>
        <SafeAreaView style={container}>
          <View style={headerContainerStyle}>
            <Ionicons onPress={hideModal} name="ios-arrow-back" size={40} color="#BDBDBD" />
          </View>
          <ScrollView style={scrollViewStyle}>
            <View style={profileContainerStyle}>
              <View style={imageContainerStyle}>
                <Image resizeMode="contain" source={{ uri: photoUrl }} style={imgStyle} />
              </View>
              <View style={nameContainerStyle}>
                <Text style={nameTextStyle}>{name}</Text>
                <Text style={sugoTextStyle}>{title}</Text>
              </View>
            </View>
            <View style={detailsContainerStyle}>
              <Text style={[detailsTextStyle, { marginBottom: 10 }]}>Description</Text>
              <Text style={detailsTextStyle}>{desc}</Text>
            </View>
          </ScrollView>
          <View style={footerContainerStyle}>
            <View style={priceContainerStyle}>
              <Text style={priceTextStyle}>₱ {price}.00</Text>
              <Text>Some text here.</Text>
            </View>
            <View style={btnContainerStyle}>
              <TouchableOpacity onPress={() => onAcceptSugo(post)} style={btnAcceptStyle}>
                <Text style={{ color: 'white', fontSize: 20 }}>Serve Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  headerContainerStyle: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  scrollViewStyle: {
    margin: 20,
    flex: 1,
  },
  profileContainerStyle: {
    flex: 1,
  },
  detailsContainerStyle: {
    flex: 1.5,
    marginTop: 20,
  },
  footerContainerStyle: {
    height: 80,
    width: '100%',
    flexDirection: 'row',
    padding: 13,
    borderColor: '#dddddd',
    borderTopWidth: 0.5,
  },
  imageContainerStyle: {
    height: 110,
    width: 110,
    alignSelf: 'center',
  },
  nameContainerStyle: {
    flex: 1,
  },
  imgStyle: {
    flex: 1,
    height: null,
    width: null,
    borderRadius: 55,
  },
  nameTextStyle: {
    fontSize: 23,
    alignSelf: 'center',
    fontWeight: '300',
  },
  sugoTextStyle: {
    fontSize: 18,
    alignSelf: 'center',
    fontWeight: '300',
  },
  detailsTextStyle: {
    fontSize: 17,
  },
  priceContainerStyle: {
    flex: 1.6,
    justifyContent: 'center',
  },
  btnContainerStyle: {
    flex: 1,
    justifyContent: 'center',
  },
  priceTextStyle: {
    fontSize: 30,
  },
  btnAcceptStyle: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
  },
});
