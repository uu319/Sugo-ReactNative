/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { MapView } from 'expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import { GLOBAL_STYLES, LOGO_URL, getMomentAgo } from './Constants';
import MyModal from './SeekerSugoDetailsModal';
import Loading from './Loading';

export default class AcceptedPost extends Component {
  constructor(props) {
    super(props);
    this.state = { post: '', isModalVisible: false, momentAgo: '' };
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.post !== newProps.post) {
      this.setState({ post: newProps.post }, () => {
        this.renderMomentAgo();
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.countdownInterval);
  }

  renderMomentAgo = () => {
    const { post } = this.state;
    const { metadata } = post;
    const { timeStarted } = metadata;
    const initialTimeNow = new Date().getTime();
    const initialMilliseconds = initialTimeNow - timeStarted;
    this.setState({ momentAgo: getMomentAgo(initialMilliseconds) });
    if (post !== '') {
      this.countdownInterval = setInterval(() => {
        const timeNow = new Date().getTime();
        const milliseconds = timeNow - timeStarted;
        this.setState({ momentAgo: getMomentAgo(milliseconds) });
      }, 60000);
    }
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  hideModal = () => {
    this.setState({ isModalVisible: false });
  };

  onCancelSugo = async () => {
    const { post } = this.state;
    const { postId, runner, seeker } = post;
    const { seekerId } = seeker;
    const { runnerId } = runner;
    const updates = {};
    updates[`/posts/${postId}/metadata/status`] = 'pending';
    updates[`/users/${seekerId}/currentPostStatus`] = 'pending';
    updates[`/users/${runnerId}/currentPostStatus`] = 'none';
    updates[`/users/${runnerId}/currentPost`] = '';
    const database = firebase.database();
    Alert.alert(
      'Warning',
      'Are you sure you want to cancel sugo?',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await database.ref().update(updates);
            } catch (e) {
              Alert.alert('Connection Problem', 'Please try again', [{ text: 'OK' }], {
                cancelable: false,
              });
            }
          },
        },
        { text: 'Cancel' },
      ],
      {
        cancelable: false,
      },
    );
  };

  onConfirmSugo = async () => {
    const { post, momentAgo } = this.state;
    const { postId, runner, seeker } = post;
    const { seekerId } = seeker;
    const { runnerId } = runner;
    const updates = {};
    updates[`/posts/${postId}/metadata/status`] = 'confirmed';
    updates[`/posts/${postId}/metadata/momentAgo`] = momentAgo;
    updates[`/users/${seekerId}/currentPostStatus`] = 'none';
    updates[`/users/${seekerId}/currentPost`] = '';
    updates[`/users/${runnerId}/currentPostStatus`] = 'none';
    updates[`/users/${runnerId}/currentPost`] = '';
    const database = firebase.database();
    try {
      await database.ref().update(updates);
    } catch (e) {
      Alert.alert('Error', 'Please check your internet connection');
    }
  };

  renderLogo = () => {
    const { post } = this.props;
    const { metadata } = post;
    const { title } = metadata;
    if (title === 'Grocery') {
      return require('../myassets/sugoGrocery.png');
      // this.setState({ uri: require('../myassets/sugoGrocery.png') });
    }
    if (title === 'Pickup / Delivery') {
      return require('../myassets/sugoDelivery.png');
    }
    if (title === 'Filing/Claiming of Documents') {
      return require('../myassets/sugoDocuments.png');
    }
    if (title === 'Bills Payment') {
      return require('../myassets/sugoBillsPayment.png');
    }
    if (title === 'Household Chores') {
      return require('../myassets/sugoHousehold.png');
    }
    return require('../myassets/sugoOthers.png');
  };

  renderConfirmButton = () => {
    const { btnConfirmStyle } = styles;
    return (
      <TouchableOpacity onPress={this.showModal} style={btnConfirmStyle}>
        <Text style={{ color: 'white' }}>View Sugo Details</Text>
      </TouchableOpacity>
    );
  };

  renderView() {
    const { post, isModalVisible, momentAgo } = this.state;
    const { postId } = post;
    const { navProp } = this.props;
    const {
      img,
      imgContainer,
      runnerProfileContainer,
      runnerNameContainer,
      sugoNameContainer,
      messageIconContainer,
      runnerRowContainer,
      twinButtonStyle,
      detailContainer,
      nameTextStyle,
      runnerTextStyle,
      mapViewContainer,
      mapView,
      logoImageContainer,
      logoImageStyle,
      btnConfirmStyle,
      twinButtonContainer,
      twinButtonRowContainer,
      btnConfirmContainer,
    } = styles;

    return !(post === '') ? (
      <View style={{ flex: 1 }}>
        <MyModal
          title={post.metadata.title}
          desc={post.metadata.desc}
          isVisible={isModalVisible}
          hideModal={this.hideModal}
        />
        <View style={mapViewContainer}>
          <MapView
            style={mapView}
            region={{
              latitude: post.runner.lat,
              longitude: post.runner.long,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <MapView.Marker coordinate={{ latitude: post.runner.lat, longitude: post.runner.long }}>
              <Image
                source={{
                  uri: post.runner.photoURL || LOGO_URL,
                }}
                style={styles.circle}
              />
            </MapView.Marker>
          </MapView>
          <View style={twinButtonRowContainer}>
            <View style={twinButtonContainer}>
              <TouchableOpacity
                onPress={this.onCancelSugo}
                style={[twinButtonStyle, { backgroundColor: '#EB5757' }]}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={twinButtonContainer}>
              <TouchableOpacity
                onPress={this.showModal}
                style={[twinButtonStyle, { backgroundColor: '#29AB87' }]}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>View Detais</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={detailContainer}>
          <View style={logoImageContainer}>
            <Image resizeMode="contain" source={this.renderLogo()} style={logoImageStyle} />
          </View>
          <View style={{ flex: 1.5, justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: 29, fontWeight: '300' }}>
              ₱{post.metadata.price}.00
            </Text>

            {post.metadata.status === 'started' ? (
              <View style={{ flexDirection: 'row' }}>
                <Ionicons name="ios-timer" size={14} color="white" />
                <Text style={{ marginLeft: 5, color: 'white' }}>{momentAgo} time spent</Text>
              </View>
            ) : null}
          </View>
          <View style={btnConfirmContainer}>
            {post.metadata.status === 'done' ? (
              <TouchableOpacity onPress={this.onConfirmSugo} style={btnConfirmStyle}>
                <Text style={{ color: 'white', fontSize: 15 }}>Confirm</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <View style={runnerProfileContainer}>
          <View style={imgContainer}>
            <Image
              source={{
                uri: post.runner.photoURL || LOGO_URL,
              }}
              style={img}
            />
          </View>
          <View style={{ flex: 2 }}>
            <View style={runnerRowContainer}>
              <View style={{ flex: 3 }}>
                <View style={runnerNameContainer}>
                  <Text style={nameTextStyle}>{post.runner.displayName}</Text>
                </View>
                <View style={sugoNameContainer}>
                  <Text style={runnerTextStyle}>Runner</Text>
                </View>
              </View>
              <View style={messageIconContainer}>
                {this.renderMessageBadge()}
                <AntDesign
                  onPress={() => navProp.navigate('ChatApp', { postId })}
                  name="message1"
                  size={32}
                  color={GLOBAL_STYLES.BRAND_COLOR}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    ) : (
      <Loading />
    );
  }

  renderMessageBadge = () => {
    const { post } = this.state;
    const { seeker } = post;
    const { withMessage } = seeker;
    return withMessage === 'true' ? (
      <View
        style={{
          height: 12,
          width: 12,
          borderRadius: 6,
          backgroundColor: 'red',
          position: 'absolute',
          top: 15,
          right: 20,
          elevation: 2,
        }}
      />
    ) : null;
  };

  render() {
    return <View style={{ flex: 1 }}>{this.renderView()}</View>;
  }
}

const styles = StyleSheet.create({
  mapViewContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  mapView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  detailContainer: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
  },
  logoImageContainer: {
    flex: 1,
  },
  logoImageStyle: {
    flex: 1,
    width: null,
    height: null,
  },
  runnerProfileContainer: {
    height: 70,
    flexDirection: 'row',
  },
  runnerRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  imgContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: 60,
    width: 60,
    borderColor: GLOBAL_STYLES.BRAND_COLOR,
    borderWidth: 3,
    borderRadius: 30,
    marginHorizontal: 20,
  },
  runnerNameContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  nameTextStyle: {
    fontSize: 20,
    color: GLOBAL_STYLES.BRAND_COLOR,
  },
  runnerTextStyle: {
    color: '#828282',
  },
  sugoNameContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  messageIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'red',
  },
  pinText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 10,
  },
  twinButtonRowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  twinButtonContainer: {
    width: '28%',
    height: 35,
    marginVertical: 10,
  },
  twinButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    width: '100%',
    height: 30,
  },
  btnConfirmContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirmStyle: {
    height: '50%',
    width: '75%',
    borderRadius: 5,
    backgroundColor: '#FFCA85',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
