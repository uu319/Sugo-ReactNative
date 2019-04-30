/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import { Location, Permissions } from 'expo';
import MyModal from './RunnerSugoDetailsModal';
import { getMomentAgo } from './Constants';

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

  getLatLongAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});
        return location;
      } catch {
        console.log('error on location');
      }
    }
    return null;
  };

  getAddressByLatLong = async (longitude, latitude) => {
    try {
      const address = await Location.reverseGeocodeAsync({ longitude, latitude });
      return address;
    } catch {
      console.log('error on address');
    }
    return null;
  };

  updateSugoOnFirebase = async (post, lat, long) => {
    const { userInfo } = this.props;
    const { email, userId, displayName, photoURL } = userInfo;
    const { postId, seeker } = post;
    const { seekerId } = seeker;
    const runner = {
      email,
      runnerId: userId,
      lat,
      long,
      displayName,
      photoURL,
      withMessage: 'false',
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
    this.getLatLongAsync()
      .then(loc => {
        const { longitude, latitude } = loc.coords;
        this.updateSugoOnFirebase(post, latitude, longitude);
      })
      .catch(() => {
        // this.setState({ loading: false, editable: true });
        Alert.alert('Fetching location failed', 'Pl', [{ text: 'OK' }], {
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

  // getMomentAgo = milliseconds => {
  //   let momentAgo = '';
  //   const seconds = milliseconds / 1000;
  //   const minutes = seconds / 60;
  //   const hour = minutes / 60;
  //   const day = hour / 24;
  //
  //   if (seconds < 60) {
  //     momentAgo = `${Math.round(seconds)} sec ago`;
  //   } else if (seconds > 60 && minutes < 60) {
  //     momentAgo = `${Math.round(minutes)} min ago`;
  //   } else if (minutes > 60 && hour < 24) {
  //     momentAgo = `${Math.round(hour)} hr ago`;
  //   } else {
  //     momentAgo = `${Math.round(day)} days ago`;
  //   }
  //   this.setState({ momentAgo });
  // };

  // renderMomentAgo = () => {
  //
  //   const { metadata } = post;
  //   const { timeStamp } = metadata;
  //   const newDate = new Date().getTime();
  //   const milliseconds = newDate - timeStamp;
  //   this.getMomentAgo(milliseconds);
  //   this.countdownInterval = setInterval(() => {
  //     this.getMomentAgo(milliseconds);
  //   }, 10000);
  // };

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

  // <Text style={titleTextStyle}>{post.metadata.title}</Text>
  // <ScrollView style={descContainerStyle}>
  //   <Text style={descTextStyle}>{post.metadata.desc}</Text>
  // </ScrollView>
  // <TouchableOpacity style={btnSubmitStyle} onPress={() => console.log(post.id)}>
  //   <Text style={{ color: 'white' }}>Accept</Text>
  // </TouchableOpacity>

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
    height: 120,
    width: '95%',
    borderColor: '#dddddd',
    borderWidth: 0.4,
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
  },
  priceTextStyle: {
    color: '#7F838F',
    fontSize: 24,
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
