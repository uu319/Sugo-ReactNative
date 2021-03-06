import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ProgressBarAndroid,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { GLOBAL_STYLES, renderSugoLogo } from './Constants';

export default class SelectedSugo extends Component {
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
      addressTextStyle,
      detailsTextStyle,
      priceContainerStyle,
      btnContainerStyle,
      priceTextStyle,
      btnAcceptStyle,
      progressbarContainer,
    } = styles;
    const { post, hideModal, isVisible, onAcceptSugo, isProgressBarVisible } = this.props;
    const { metadata, seeker } = post;
    const { displayName, photoURL } = seeker;
    const { title, desc, price, address } = metadata;
    return (
      <Modal animationOut="slideOutLeft" isVisible={isVisible} style={{ margin: 0 }}>
        <SafeAreaView style={container}>
          <View style={headerContainerStyle}>
            <Ionicons onPress={hideModal} name="ios-arrow-back" size={40} color="#BDBDBD" />
          </View>
          <ScrollView style={scrollViewStyle}>
            <View style={profileContainerStyle}>
              <View style={imageContainerStyle}>
                <Image resizeMode="contain" source={{ uri: photoURL }} style={imgStyle} />
              </View>
              <View style={nameContainerStyle}>
                <Text style={nameTextStyle}>{displayName}</Text>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={addressTextStyle}>{address}</Text>
                </View>
              </View>
            </View>
            <View style={detailsContainerStyle}>
              <Text style={[detailsTextStyle, { marginBottom: 10 }]}>Description</Text>
              <Text style={detailsTextStyle}>{desc}</Text>
            </View>
          </ScrollView>
          {isProgressBarVisible ? (
            <View style={progressbarContainer}>
              <Text style={{ color: GLOBAL_STYLES.BRAND_COLOR }}>Accepting Sugo, please wait.</Text>
              <ProgressBarAndroid
                color={GLOBAL_STYLES.BRAND_COLOR}
                animating
                styleAttr="Horizontal"
                style={{ height: 50, width: '100%' }}
              />
            </View>
          ) : null}

          <View style={footerContainerStyle}>
            <View style={priceContainerStyle}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}
              >
                <Image
                  resizeMode="contain"
                  source={renderSugoLogo(title)}
                  style={{
                    height: 16,
                    width: 16,
                    borderRadius: 4,
                    marginRight: 6,
                  }}
                />
                <Text style={addressTextStyle}>{title}</Text>
              </View>
              <Text style={priceTextStyle}>₱ {price}.00</Text>
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
    borderTopWidth: 3,
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
  addressTextStyle: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '300',
    color: '#828282',
  },
  detailsTextStyle: {
    fontSize: 17,
    color: '#6E798A',
  },
  priceContainerStyle: {
    flex: 1.8,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  btnContainerStyle: {
    flex: 1,
    justifyContent: 'center',
  },
  priceTextStyle: {
    fontSize: 30,
    fontWeight: '400',
  },
  btnAcceptStyle: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
  },
  progressbarContainer: {
    height: 50,
    width: '100%',
    padding: 0,
    alignItems: 'center',
  },
});
