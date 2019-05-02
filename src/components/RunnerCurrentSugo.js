import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { MapView } from 'expo';
import { AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import * as firebase from 'firebase';
import {
  GLOBAL_STYLES,
  LOGO_URL,
  getMomentAgo,
  renderSugoLogo,
  sendNotification,
  getLatLongAsync,
} from './Constants';
import MyModal from './ViewSugoSlideUp';
import Loading from './Loading';
import Chat from './ChatModal';

export default class CurrentSugo extends Component {
  constructor(props) {
    super(props);
    this.state = { post: '', isModalVisible: false, momentAgo: '', isMsgModalVisible: false };
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

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  hideModal = () => {
    this.setState({ isModalVisible: false });
  };

  showMsgModal = () => {
    this.setState({ isMsgModalVisible: true });
  };

  hideMsgModal = () => {
    this.setState({ isMsgModalVisible: false });
  };

  renderMomentAgo = () => {
    const { post } = this.state;
    const { metadata } = post;
    const { timeStarted } = metadata;
    const initialTimeNow = new Date().getTime();
    let initialMilliseconds = initialTimeNow - timeStarted;
    this.setState({ momentAgo: getMomentAgo(initialMilliseconds) });
    if (post !== '') {
      this.countdownInterval = setInterval(async () => {
        const timeNow = await new Date().getTime();
        if (timeNow) {
          initialMilliseconds += 65000;
          this.setState({ momentAgo: getMomentAgo(initialMilliseconds) });
        }
      }, 60000);
    }
  };

  onUpdateSugoStatus = async update => {
    const { post } = this.state;
    const { postId, runner, seeker } = post;
    const { seekerId, seekerToken } = seeker;
    const { runnerId } = runner;
    const notifTitle = 'Hoooray!';
    let notifBody = '';
    const database = firebase.database();
    const updates = {};
    updates[`/posts/${postId}/metadata/status`] = update;
    updates[`/users/${seekerId}/currentPostStatus`] = update;
    updates[`/users/${runnerId}/currentPostStatus`] = update;
    const timeStamp = new Date().getTime();
    if (update === 'started') {
      updates[`/posts/${postId}/metadata/timeStarted`] = timeStamp;
      notifBody = 'Your runner started your sugo';
    }
    if (update === 'done') {
      updates[`/posts/${postId}/metadata/timeDone`] = timeStamp;
      notifBody = 'Your runner completed your sugo';
    }
    try {
      await database.ref().update(updates);
      sendNotification(seekerToken, notifTitle, notifBody);
    } catch (e) {
      Alert.alert('Error', 'Please check your internet connection');
    }
  };

  updateLocation = () => {
    const database = firebase.database();
    const { post } = this.state;
    const { postId, seeker, runner } = post;
    const { seekerToken } = seeker;
    const { displayName } = runner;
    const updates = {};
    Alert.alert(
      `Hi ${displayName}`,
      'Update your location so your seeker can locate you?',
      [
        {
          text: 'OK',
          onPress: async () => {
            getLatLongAsync()
              .then(async loc => {
                const { longitude, latitude } = loc.coords;
                updates[`/posts/${postId}/runner/lat`] = latitude;
                updates[`/posts/${postId}/runner/long`] = longitude;
                try {
                  await database.ref().update(updates);
                  sendNotification(seekerToken, 'Notice', 'Your runner updated location!');
                  Alert.alert('Success', 'You have succesfully updated your location!');
                } catch (e) {
                  Alert.alert('Error', 'Please check your internet connection');
                }
              })
              .catch(() => {
                Alert.alert(
                  'Fetching location failed',
                  'Please turn on your location.',
                  [{ text: 'OK' }],
                  {
                    cancelable: false,
                  },
                );
              });
          },
        },
        { text: 'Cancel' },
      ],
      {
        cancelable: false,
      },
    );
  };

  renderStatus = () => {
    const { post, momentAgo } = this.state;
    if (post.metadata.status === 'accepted') {
      return (
        <View style={{ flexDirection: 'row' }}>
          <AntDesign name="ellipsis1" size={14} color="white" />
          <Text style={{ marginLeft: 5, color: 'white' }}>Waiting to start</Text>
        </View>
      );
    }
    if (post.metadata.status === 'started') {
      return (
        <View style={{ flexDirection: 'row' }}>
          <Ionicons name="ios-timer" size={14} color="white" />
          <Text style={{ marginLeft: 5, color: 'white' }}>{momentAgo} time spent</Text>
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row' }}>
        <AntDesign name="ellipsis1" size={14} color="white" />
        <Text style={{ marginLeft: 5, color: 'white' }}>Waiting for confirmation</Text>
      </View>
    );
  };

  renderBtnToggle = () => {
    const { post } = this.state;
    const { btnToggleStyle } = styles;
    if (post.metadata.status === 'accepted') {
      return (
        <TouchableOpacity onPress={() => this.onUpdateSugoStatus('started')} style={btnToggleStyle}>
          <Text style={{ color: 'white', fontSize: 15 }}>Start</Text>
        </TouchableOpacity>
      );
    }
    if (post.metadata.status === 'started') {
      return (
        <TouchableOpacity onPress={() => this.onUpdateSugoStatus('done')} style={btnToggleStyle}>
          <Text style={{ color: 'white', fontSize: 15 }}>Done</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  renderView() {
    const { post, isModalVisible, isMsgModalVisible } = this.state;
    const {
      img,
      imgContainer,
      seekerProfileContainer,
      seekerNameContainer,
      sugoNameContainer,
      messageIconContainer,
      seekerRowContainer,
      floatingButtonRowContainer,
      viewDetailsButtonStyle,
      mapView,
      mapViewContainer,
      nameTextStyle,
      detailContainer,
      logoImageStyle,
      logoImageContainer,
      btnToggleContainer,
      seekerTextStyle,
      updateLocationButtonStyle,
    } = styles;

    return !(post === '') ? (
      <View style={{ flex: 1 }}>
        <MyModal
          title={post.metadata.title}
          desc={post.metadata.desc}
          isVisible={isModalVisible}
          hideModal={this.hideModal}
        />
        <Chat
          post={post}
          postId={post.postId}
          isVisible={isMsgModalVisible}
          hideModal={this.hideMsgModal}
        />
        <View style={mapViewContainer}>
          <MapView
            style={mapView}
            region={{
              latitude: post.seeker.lat,
              longitude: post.seeker.long,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <MapView.Marker coordinate={{ latitude: post.seeker.lat, longitude: post.seeker.long }}>
              <Image
                source={{
                  uri: post.seeker.photoURL || LOGO_URL,
                }}
                style={styles.circle}
              />
            </MapView.Marker>
          </MapView>
          <View style={floatingButtonRowContainer}>
            <TouchableOpacity onPress={this.showModal} style={viewDetailsButtonStyle}>
              <Text style={{ color: 'white', fontSize: 17 }}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.updateLocation} style={updateLocationButtonStyle}>
              <FontAwesome name="location-arrow" size={26} color="white" />
            </TouchableOpacity>
          </View>
          <View style={detailContainer}>
            <View style={logoImageContainer}>
              <Image
                resizeMode="contain"
                source={renderSugoLogo(post.metadata.title)}
                style={logoImageStyle}
              />
            </View>
            <View style={{ flex: 1.5, justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 29, fontWeight: '300' }}>
                ₱{post.metadata.price}.00
              </Text>

              {this.renderStatus()}
            </View>
            <View style={btnToggleContainer}>{this.renderBtnToggle()}</View>
          </View>
        </View>
        <View style={seekerProfileContainer}>
          <View style={imgContainer}>
            <Image
              source={{
                uri: post.seeker.photoURL || LOGO_URL,
              }}
              style={img}
            />
          </View>
          <View style={{ flex: 2 }}>
            <View style={seekerRowContainer}>
              <View style={{ flex: 3 }}>
                <View style={seekerNameContainer}>
                  <Text style={nameTextStyle}>{post.seeker.displayName}</Text>
                </View>
                <View style={sugoNameContainer}>
                  <Text style={seekerTextStyle}>Seeker</Text>
                </View>
              </View>
              <View style={messageIconContainer}>
                {this.renderMessageBadge()}
                <AntDesign
                  onPress={this.showMsgModal}
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
    const { runner } = post;
    const { withMessage } = runner;
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
  seekerProfileContainer: {
    height: 70,
    flexDirection: 'row',
  },
  seekerRowContainer: {
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
  seekerNameContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  nameTextStyle: {
    fontSize: 20,
    color: GLOBAL_STYLES.BRAND_COLOR,
  },
  sugoNameContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  seekerTextStyle: {
    color: '#828282',
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
  btnSubmitStyle: {
    backgroundColor: 'green',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  floatingButtonRowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  twinButtonContainer: {
    width: '28%',
    height: 70,
    marginVertical: 10,
  },
  viewDetailsButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#29AB87',
    marginBottom: 20,
    marginLeft: 30,
    width: '30%',
    height: 30,
  },
  updateLocationButtonStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
    borderRadius: 30,
    marginBottom: 12,
    marginRight: 20,
    width: 60,
    height: 60,
  },
  btnToggleContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnToggleStyle: {
    height: '50%',
    width: '75%',
    borderRadius: 5,
    backgroundColor: '#FFCA85',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
