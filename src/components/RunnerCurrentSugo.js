import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { MapView } from 'expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import { GLOBAL_STYLES, LOGO_URL, getMomentAgo, renderSugoLogo } from './Constants';
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
        console.log('timeNow', timeNow);
        if (timeNow) {
          initialMilliseconds += 60000;
          this.setState({ momentAgo: getMomentAgo(initialMilliseconds) });
        }
      }, 60000);
    }
  };

  onUpdateSugoStatus = async update => {
    const { post } = this.state;
    const { postId, runner, seeker } = post;
    const { seekerId } = seeker;
    const { runnerId } = runner;
    const database = firebase.database();
    const updates = {};
    updates[`/posts/${postId}/metadata/status`] = update;
    updates[`/users/${seekerId}/currentPostStatus`] = update;
    updates[`/users/${runnerId}/currentPostStatus`] = update;
    const timeStamp = new Date().getTime();
    if (update === 'started') {
      updates[`/posts/${postId}/metadata/timeStarted`] = timeStamp;
    }
    if (update === 'done') {
      updates[`/posts/${postId}/metadata/timeDone`] = timeStamp;
    }
    try {
      await database.ref().update(updates);
    } catch (e) {
      Alert.alert('Error', 'Please check your internet connection');
    }
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
      twinButtonRowContainer,
      twinButtonContainer,
      twinButtonStyle,
      mapView,
      mapViewContainer,
      nameTextStyle,
      detailContainer,
      logoImageStyle,
      logoImageContainer,
      btnToggleContainer,
    } = styles;

    return !(post === '') ? (
      <View style={{ flex: 1 }}>
        <MyModal
          title={post.metadata.title}
          desc={post.metadata.desc}
          isVisible={isModalVisible}
          hideModal={this.hideModal}
        />
        <Chat postId={post.postId} isVisible={isMsgModalVisible} hideModal={this.hideMsgModal} />
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
          <View style={twinButtonRowContainer}>
            <View style={twinButtonContainer}>
              <TouchableOpacity
                onPress={this.showModal}
                style={[twinButtonStyle, { backgroundColor: '#29AB87' }]}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>View Detais</Text>
              </TouchableOpacity>
            </View>
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
                  <Text>Seeker</Text>
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
    console.log(this.props);
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
