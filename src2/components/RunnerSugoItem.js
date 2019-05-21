/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  NetInfo,
  Platform,
} from 'react-native';
import { Location, Permissions, IntentLauncherAndroid } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import SelectedSugo from './RunnerSugoItemSelectedModal';
import { getMomentAgo, sendNotification } from './Constants';

export default class SugoItem extends Component {
  state = {
    momentAgo: '',
    uri: '',
    isModalVisible: false,
    isProgressBarVisible: false,
  };

  componentDidMount() {
    this.renderLogo();
    this.renderMomentAgo();
  }

  componentWillUnmount() {
    clearInterval(this.countdownInterval);
  }

  acceptSugo = async post => {
    const { userInfo } = this.props;
    const { email, userId, displayName, photoURL, token } = userInfo;
    const { postId, seeker } = post;
    const { seekerId, seekerToken } = seeker;
    if (Platform.OS === 'android') {
      NetInfo.isConnected.fetch().then(async isConnected => {
        if (isConnected) {
          const { status } = await Permissions.askAsync(Permissions.LOCATION);
          if (status === 'granted') {
            this.setState({ isProgressBarVisible: true });
            try {
              const location = await Location.getCurrentPositionAsync({});
              const { latitude, longitude } = location.coords;
              const runner = {
                email,
                runnerId: userId,
                lat: latitude,
                long: longitude,
                displayName,
                photoURL,
                withMessage: 'false',
                runnerToken: token,
              };
              const updates = {};
              updates[`/posts/${postId}/metadata/status`] = 'accepted';
              updates[`/posts/${postId}/runner`] = runner;
              updates[`/users/${seekerId}/currentPost`] = postId;
              updates[`/users/${seekerId}/currentPostStatus`] = 'accepted';
              updates[`/users/${userId}/currentPostStatus`] = 'accepted';
              updates[`/users/${userId}/currentPost`] = postId;
              const database = firebase.database();
              await database
                .ref(`posts/${postId}/metadata/status`)
                .once('value', async snapshot => {
                  if (snapshot.val() === 'pending') {
                    try {
                      await database.ref().update(updates);
                      sendNotification(seekerToken, 'Horay!', 'Someone accepted your sugo');
                      this.setState({ isModalVisible: false });
                      this.setState({ isProgressBarVisible: false });
                    } catch (e) {
                      Alert.alert('Something went wrong please try again');
                    }
                  } else {
                    Alert.alert('Something went wrong please try again');
                  }
                });
            } catch (e) {
              this.setState({ isProgressBarVisible: false });
              if (e.code === 'E_LOCATION_SERVICES_DISABLED') {
                Alert.alert(
                  'Location',
                  'SugoPH wants access to your location services.',
                  [
                    { text: 'Do not allow.', style: 'cancel' },
                    {
                      text: 'Go to settings.',
                      onPress: () =>
                        IntentLauncherAndroid.startActivityAsync(
                          IntentLauncherAndroid.ACTION_LOCATION_SOURCE_SETTINGS,
                        ),
                    },
                  ],
                  { cancelable: false },
                );
              } else {
                Alert.alert(
                  'Error',
                  `${
                    e.message
                  } Sorry for having this issue, SugoPH team will look into this as soon as possible.`,
                );
              }
            }
          }
        } else {
          Alert.alert('Connection Problem.', 'Please check your internet connection');
        }
      });
    }
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  hideModal = () => {
    this.setState({ isModalVisible: false });
  };

  renderLogo = () => {
    const { post } = this.props;
    const { metadata } = post;
    const { title } = metadata;
    if (title === 'Grocery') {
      this.setState({ uri: require('../myassets/sugoGrocery.png') });
    } else if (title === 'Pickup / Delivery') {
      this.setState({ uri: require('../myassets/sugoDelivery.png') });
    } else if (title === 'Filing/Claiming of Documents') {
      this.setState({ uri: require('../myassets/sugoDocuments.png') });
    } else if (title === 'Bills Payment') {
      this.setState({ uri: require('../myassets/sugoBillsPayment.png') });
    } else if (title === 'Household Chores') {
      this.setState({ uri: require('../myassets/sugoHousehold.png') });
    } else {
      this.setState({ uri: require('../myassets/sugoOthers.png') });
    }
  };

  renderMomentAgo = () => {
    const { post } = this.props;
    const { metadata } = post;
    const { timeStamp } = metadata;
    const initialTimeNow = new Date().getTime();
    const initialSeconds = (initialTimeNow - timeStamp) / 1000;
    this.setState({ momentAgo: getMomentAgo(initialSeconds) });
    if (post !== '') {
      this.countdownInterval = setInterval(() => {
        const timeNow = new Date().getTime();
        const seconds = (timeNow - timeStamp) / 1000;
        this.setState({ momentAgo: getMomentAgo(seconds) });
      }, 10000);
    }
  };

  render() {
    const { post } = this.props;
    const { momentAgo, uri, isModalVisible, isProgressBarVisible } = this.state;
    const {
      container,
      infoContainer,
      priceTextStyle,
      nameTextStyle,
      addressTextStyle,
      innerRowContainer,
      innerRightContainer,
      momentAgoContainer,
      momentAgoTextStyle,
      imageContainerStyle,
      imgStyle,
    } = styles;
    return (
      <TouchableOpacity onPress={this.showModal} style={container}>
        <SelectedSugo
          post={post}
          isVisible={isModalVisible}
          hideModal={this.hideModal}
          onAcceptSugo={this.acceptSugo}
          sugoLogo={uri}
          isProgressBarVisible={isProgressBarVisible}
        />
        <View style={infoContainer}>
          <Text style={priceTextStyle}>{`₱${post.metadata.price}.00`}</Text>
          <View>
            <View style={innerRowContainer}>
              <Ionicons name="ios-person" size={18} color="gray" />
              <Text adjustsFontSizeToFit numberOfLines={1} style={nameTextStyle}>
                {post.seeker.displayName}
              </Text>
            </View>
            <View style={innerRowContainer}>
              <Ionicons name="md-locate" size={18} color="gray" />
              <Text adjustsFontSizeToFit numberOfLines={1} style={addressTextStyle}>
                {post.metadata.address}
              </Text>
            </View>
          </View>
        </View>
        <View style={innerRightContainer}>
          <View style={momentAgoContainer}>
            <Text style={momentAgoTextStyle}>{momentAgo} ago</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={imageContainerStyle}>
              <Image resizeMode="contain" source={uri} style={imgStyle} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: '95%',
    borderRadius: 10,
    alignSelf: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    margin: 5,
    elevation: 1,
  },
  infoContainer: {
    flex: 2,
    padding: 13,
    justifyContent: 'space-around',
  },
  priceTextStyle: {
    color: '#7F838F',
    fontSize: 33,
    fontWeight: '300',
  },
  nameTextStyle: {
    color: '#585966',
    fontSize: 16,
    marginLeft: 5,
  },
  addressTextStyle: {
    color: '#585966',
    fontSize: 16,
    marginLeft: 3,
  },
  innerRowContainer: {
    flexDirection: 'row',
  },
  innerRightContainer: {
    flex: 1,
  },
  momentAgoContainer: {
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
    paddingTop: 10,
  },
  momentAgoTextStyle: {
    color: '#828282',
  },
  imageContainerStyle: {
    height: 76,
    width: 76,
    marginLeft: 7,
    alignSelf: 'center',
  },
  imgStyle: {
    height: null,
    width: null,
    flex: 1,
    borderRadius: 10,
  },
});
