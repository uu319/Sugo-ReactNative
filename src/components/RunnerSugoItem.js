/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import MyModal from './RunnerSugoDetailsModal';
import { getMomentAgo, sendNotification, getLatLongAsync } from './Constants';

export default class SugoList extends Component {
  state = {
    momentAgo: '',
    uri: '',
    isModalVisible: false,
  };

  componentDidMount() {
    this.renderLogo();
    this.renderMomentAgo();
  }

  componentWillUnmount() {
    clearInterval(this.countdownInterval);
  }

  updateSugoOnFirebase = async (post, lat, long) => {
    const { userInfo } = this.props;
    const { email, userId, displayName, photoURL, token } = userInfo;
    const { postId, seeker } = post;
    const { seekerId, seekerToken } = seeker;
    const runner = {
      email,
      runnerId: userId,
      lat,
      long,
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
    try {
      await database.ref(`posts/${postId}/metadata/status`).once('value', async snapshot => {
        if (snapshot.val() === 'pending') {
          try {
            await database.ref().update(updates);
            sendNotification(seekerToken, 'Horay!', 'Someone accepted your sugo');
            this.setState({ isModalVisible: false });
          } catch (e) {
            Alert.alert('Something went wrong please try again');
          }
        } else {
          Alert.alert('Something went wrong please try again');
        }
      });
    } catch (e) {
      Alert.alert('Something went wrong please try again');
    }
  };

  acceptSugo = post => {
    getLatLongAsync()
      .then(loc => {
        const { longitude, latitude } = loc.coords;
        this.updateSugoOnFirebase(post, latitude, longitude);
      })
      .catch(() => {
        Alert.alert('Fetching location failed', 'Please turn on your location.', [{ text: 'OK' }], {
          cancelable: false,
        });
      });
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
    const initialMilliseconds = initialTimeNow - timeStamp;
    this.setState({ momentAgo: getMomentAgo(initialMilliseconds) });
    if (post !== '') {
      this.countdownInterval = setInterval(() => {
        const timeNow = new Date().getTime();
        const milliseconds = timeNow - timeStamp;
        this.setState({ momentAgo: getMomentAgo(milliseconds) });
      }, 10000);
    }
  };

  render() {
    const { post } = this.props;
    const { momentAgo, uri, isModalVisible } = this.state;
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
        <MyModal
          post={post}
          isVisible={isModalVisible}
          hideModal={this.hideModal}
          onAcceptSugo={this.acceptSugo}
          sugoLogo={uri}
        />
        <View style={infoContainer}>
          <Text style={priceTextStyle}>{`₱${post.metadata.price}.00`}</Text>
          <View style={innerRowContainer}>
            <Ionicons name="ios-person" size={18} color="gray" />
            <Text style={nameTextStyle}>{post.seeker.displayName}</Text>
          </View>
          <View style={innerRowContainer}>
            <Ionicons name="md-locate" size={18} color="gray" />
            <Text style={addressTextStyle}>{post.metadata.address}</Text>
          </View>
        </View>
        <View style={innerRightContainer}>
          <View style={momentAgoContainer}>
            <Text style={momentAgoTextStyle}>{momentAgo} ago</Text>
          </View>
          <View style={imageContainerStyle}>
            <Image resizeMode="contain" source={uri} style={imgStyle} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    width: '95%',
    // borderColor: '#dddddd',
    // borderWidth: 0.4,
    borderRadius: 10,
    alignSelf: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    margin: 5,
    elevation: 2,
  },
  infoContainer: {
    flex: 2,
    padding: 13,
    justifyContent: 'center',
  },
  priceTextStyle: {
    color: '#7F838F',
    fontSize: 24,
    fontWeight: '500',
  },
  nameTextStyle: {
    color: '#585966',
    fontSize: 16,
  },
  addressTextStyle: {
    color: '#585966',
    fontSize: 16,
  },
  innerRowContainer: {
    flexDirection: 'row',
  },
  innerRightContainer: {
    flex: 1,
  },
  momentAgoContainer: {
    height: 14,
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
  },
  momentAgoTextStyle: {
    color: '#828282',
  },
  imageContainerStyle: {
    height: 76,
    width: 76,
    marginTop: 10,
    marginLeft: 7,
  },
  imgStyle: {
    height: null,
    width: null,
    flex: 1,
    borderRadius: 10,
  },
});
