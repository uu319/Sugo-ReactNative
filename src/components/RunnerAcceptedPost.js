import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  NetInfo,
  ProgressBarAndroid,
} from 'react-native';
import { MapView, Permissions, Location, IntentLauncherAndroid } from 'expo';
import { AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import * as firebase from 'firebase';
import MapViewDirections from 'react-native-maps-directions';
import {
  GLOBAL_STYLES,
  LOGO_URL,
  getMomentAgo,
  renderSugoLogo,
  sendNotification,
} from './Constants';
import MyModal from './ViewSugoSlideUpModal';
import Loading from './Loading';
import Chat from './ChatModal';

const { width, height } = Dimensions.get('window');
export default class CurrentSugo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: '',
      isSugoDetailsModalVisible: false,
      momentAgo: '',
      isMsgModalVisible: false,
      isProgressBarVisible: false,
      progressBarText: '',
      region: '',
      distance: '',
    };
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.post !== newProps.post) {
      const { post } = newProps;
      const { seeker } = post;
      const { lat, long } = seeker;
      const region = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      this.setState({ post, region }, () => {
        this.renderMomentAgo();
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.countdownInterval);
  }

  showModal = () => {
    this.setState({ isSugoDetailsModalVisible: true });
  };

  hideModal = () => {
    this.setState({ isSugoDetailsModalVisible: false });
  };

  showMsgModal = () => {
    this.setState({ isMsgModalVisible: true });
  };

  hideMsgModal = () => {
    this.setState({ isMsgModalVisible: false });
  };

  renderMomentAgo = () => {
    const { post } = this.props;
    const { metadata } = post;
    const { timeStarted } = metadata;
    if (post.metadata.timeStarted !== '') {
      const initialTimeNow = new Date().getTime();
      const initialSeconds = (initialTimeNow - timeStarted) / 1000;
      this.setState({ momentAgo: getMomentAgo(initialSeconds) });
      if (post !== '') {
        this.countdownInterval = setInterval(async () => {
          const timeNow = new Date().getTime();
          const seconds = (timeNow - timeStarted) / 1000;
          this.setState({ momentAgo: getMomentAgo(seconds) });
        }, 60000);
      }
    }
  };

  onUpdateSugoStatus = async update => {
    const database = firebase.database();

    const { post } = this.state;
    const { postId, runner, seeker } = post;
    const { seekerId, seekerToken } = seeker;
    const { runnerId } = runner;
    const notifTitle = 'Hoooray!';
    let notifBody = '';
    let progressBarText = '';

    const updates = {};
    updates[`/posts/${postId}/metadata/status`] = update;
    updates[`/users/${seekerId}/currentPostStatus`] = update;
    updates[`/users/${runnerId}/currentPostStatus`] = update;
    const timeStamp = new Date().getTime();
    if (update === 'started') {
      updates[`/posts/${postId}/metadata/timeStarted`] = timeStamp;
      notifBody = 'Your runner started your sugo';
      progressBarText = 'Starting Sugo, please wait.';
    }
    if (update === 'done') {
      updates[`/posts/${postId}/metadata/timeDone`] = timeStamp;
      notifBody = 'Your runner completed your sugo';
      progressBarText = 'Completing, please wait.';
    }
    if (Platform.OS === 'android') {
      NetInfo.isConnected.fetch().then(async isConnected => {
        if (isConnected) {
          this.setState({
            isProgressBarVisible: true,
            progressBarText,
          });
          database.ref(`posts/${postId}/metadata/status`).once('value', async val => {
            if (val.val() !== 'cancelled') {
              try {
                await database.ref().update(updates);
                sendNotification(seekerToken, notifTitle, notifBody);
                this.setState({
                  isProgressBarVisible: false,
                  progressBarText: '',
                });
              } catch ({ message }) {
                this.setState({
                  isProgressBarVisible: false,
                  progressBarText: '',
                });
                Alert.alert(
                  'Error',
                  'Sorry for having this issue, SugoPH team will look into this as soon as possible.',
                );
                database()
                  .ref('errors')
                  .push(message);
              }
            }
          });
        } else {
          Alert.alert('Connection Problem.', 'Please check your internet connection');
        }
      });
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
            if (Platform.OS === 'android') {
              NetInfo.isConnected.fetch().then(async isConnected => {
                if (isConnected) {
                  const { status } = await Permissions.askAsync(Permissions.LOCATION);
                  if (status === 'granted') {
                    this.setState({
                      isProgressBarVisible: true,
                      progressBarText: 'Updating Location, please wait.',
                    });
                    try {
                      const location = await Location.getCurrentPositionAsync({});
                      const { latitude, longitude } = location.coords;
                      updates[`/posts/${postId}/runner/lat`] = latitude;
                      updates[`/posts/${postId}/runner/long`] = longitude;
                      await database.ref().update(updates);
                      sendNotification(seekerToken, 'Notice', 'Your runner updated location!');
                      this.setState({
                        isProgressBarVisible: false,
                        progressBarText: '',
                      });
                      Alert.alert('Success', 'You have succesfully updated your location!');
                    } catch (e) {
                      this.setState({
                        isProgressBarVisible: false,
                        progressBarText: '',
                      });
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
                        this.setState({
                          isProgressBarVisible: false,
                          progressBarText: '',
                        });
                        Alert.alert(
                          'Error',
                          'Sorry for having this issue, SugoPH team will look into this as soon as possible.',
                        );
                        database.ref('errors').push(e.message);
                      }
                    }
                  }
                } else {
                  Alert.alert('Connection Problem.', 'Please check your internet connection');
                }
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

  renderStatus = () => {
    const { post, momentAgo } = this.state;
    if (post.metadata.status === 'accepted') {
      return (
        <View style={{ flexDirection: 'row' }}>
          <AntDesign name="ellipsis1" size={14} color="white" />
          <Text adjustsFontSizeToFit style={{ marginLeft: 5, color: 'white' }}>
            Waiting to start
          </Text>
        </View>
      );
    }
    if (post.metadata.status === 'started') {
      return (
        <View style={{ flexDirection: 'row' }}>
          <Ionicons name="ios-timer" size={14} color="white" />
          <Text adjustsFontSizeToFit style={{ marginLeft: 5, color: 'white' }}>
            {momentAgo} time spent
          </Text>
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row' }}>
        <AntDesign name="ellipsis1" size={14} color="white" />
        <Text adjustsFontSizeToFit style={{ marginLeft: 5, color: 'white' }}>
          Waiting for confirmation
        </Text>
      </View>
    );
  };

  renderBtnToggle = () => {
    const { post } = this.state;
    const { btnToggleStyle } = styles;
    if (post.metadata.status === 'accepted') {
      return (
        <TouchableOpacity onPress={() => this.onUpdateSugoStatus('started')} style={btnToggleStyle}>
          <Text adjustsFontSizeToFit style={{ color: 'white' }}>
            Start
          </Text>
        </TouchableOpacity>
      );
    }
    if (post.metadata.status === 'started') {
      return (
        <TouchableOpacity onPress={() => this.onUpdateSugoStatus('done')} style={btnToggleStyle}>
          <Text adjustsFontSizeToFit style={{ color: 'white' }}>
            Done
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  onReady = result => {
    this.mapView.fitToCoordinates(result.coordinates, {
      edgePadding: {
        right: width / 20,
        bottom: height / 20,
        left: width / 20,
        top: height / 20,
      },
    });
  };

  onError = errorMessage => {
    Alert.alert('title', JSON.stringify(errorMessage));
  };

  renderProgress = () => {
    const { isProgressBarVisible, progressBarText } = this.state;
    const { progressbarContainer } = styles;
    return isProgressBarVisible ? (
      <View style={progressbarContainer}>
        <Text style={{ color: GLOBAL_STYLES.BRAND_COLOR }}>{progressBarText}</Text>
        <ProgressBarAndroid
          color={GLOBAL_STYLES.BRAND_COLOR}
          animating
          styleAttr="Horizontal"
          style={{ height: 50, width: '100%' }}
        />
      </View>
    ) : null;
  };

  renderView() {
    const { post, isSugoDetailsModalVisible, isMsgModalVisible, region, distance } = this.state;
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
      distanceContainer,
    } = styles;

    return !(post === '') ? (
      <View style={{ flex: 1 }}>
        <MyModal
          title={post.metadata.title}
          desc={post.metadata.desc}
          isVisible={isSugoDetailsModalVisible}
          hideModal={this.hideModal}
          onBackButtonPress={() => this.setState({ isSugoDetailsModalVisible: false })}
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
            initialRegion={region}
            onRegionChange={region1 => this.setState({ region: region1 })}
          >
            <MapView.Marker coordinate={{ latitude: post.seeker.lat, longitude: post.seeker.long }}>
              <View style={{ alignItems: 'center' }}>
                <View style={distanceContainer}>
                  <Text adjustsFontSizeToFit style={{ color: 'white' }}>
                    {`${Math.round(distance)} km away`}
                  </Text>
                </View>
                <Image
                  source={{
                    uri: post.seeker.photoURL || LOGO_URL,
                  }}
                  style={styles.circle}
                />
              </View>
            </MapView.Marker>
            <MapView.Marker coordinate={{ latitude: post.runner.lat, longitude: post.runner.long }}>
              <Image
                source={{
                  uri: post.runner.photoURL || LOGO_URL,
                }}
                style={styles.circle}
              />
            </MapView.Marker>
            <MapViewDirections
              origin={{ latitude: post.runner.lat, longitude: post.runner.long }}
              destination={{ latitude: post.seeker.lat, longitude: post.seeker.long }}
              apikey="AIzaSyBGa2ob4NtokBaBFS0y8SCXm-hZoJsVJmY"
              strokeWidth={3}
              strokeColor={GLOBAL_STYLES.BRAND_COLOR}
              resetOnChange={false}
              onReady={result => {
                this.setState({ distance: result.distance });
              }}
              onError={this.onError}
            />
          </MapView>
          <View>
            <View style={floatingButtonRowContainer}>
              <TouchableOpacity onPress={this.showModal} style={viewDetailsButtonStyle}>
                <Text
                  adjustsFontSizeToFit
                  style={{ fontWeight: '500', color: GLOBAL_STYLES.BRAND_COLOR }}
                >
                  View Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.updateLocation} style={updateLocationButtonStyle}>
                <FontAwesome name="location-arrow" size={26} color="white" />
              </TouchableOpacity>
            </View>
            {this.renderProgress()}
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
  distanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
    borderRadius: 5,
    padding: 5,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    borderColor: GLOBAL_STYLES.BRAND_COLOR,
    borderWidth: 1,
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
    marginBottom: 20,
    marginLeft: 30,
    backgroundColor: 'white',
    height: 30,
    paddingHorizontal: 7,
    elevation: 1,
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
    elevation: 1,
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
  progressbarContainer: {
    height: 50,
    width: '100%',
    padding: 0,
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
