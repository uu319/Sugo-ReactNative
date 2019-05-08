import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  Alert,
  AsyncStorage,
  NetInfo,
  Platform,
  TextInput,
  ActivityIndicator,
  ProgressBarAndroid,
} from 'react-native';
import { Location, Permissions, IntentLauncherAndroid } from 'expo';
import * as firebase from 'firebase';
import { Ionicons } from '@expo/vector-icons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { MONTHARRAY, GLOBAL_STYLES, renderSugoLogo } from '../components/Constants';
import { Spinner } from '../components/common/Spinner';

const { width } = Dimensions.get('window');

export default class MyModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      desc: '',
      loading: false,
    };
  }

  storePostToLocalStorage = async postId => {
    try {
      await AsyncStorage.setItem('postId', postId);
    } catch (error) {
      this.setState({ loading: false });
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  };

  insertPost = () => {
    const { desc } = this.state;
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    const { uid, displayName, email, photoURL, catName, token } = params;
    const timeStamp = new Date().getTime();
    const monthIndex = new Date().getMonth();
    const date = new Date().getDate().toString();
    const month = MONTHARRAY[monthIndex];
    const year = new Date().getFullYear();
    const dateToString = `${month} ${date}, ${year}`;
    Alert.alert(
      'Notice',
      'SugoPH currently operates within Cebu City only. ',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            this.setState({ loading: true });
            if (Platform.OS === 'android') {
              NetInfo.isConnected.fetch().then(async isConnected => {
                if (isConnected) {
                  const { status } = await Permissions.askAsync(Permissions.LOCATION);
                  if (status === 'granted') {
                    try {
                      const location = await Location.getCurrentPositionAsync({});
                      const { latitude, longitude } = location.coords;
                      const add = await Location.reverseGeocodeAsync({ longitude, latitude });
                      const addIndex = add[0];
                      const { city, street } = addIndex;
                      const address = `${street}, ${city}`;
                      const postId = `${timeStamp}${uid}`;
                      const updates = {};
                      const metadata = {
                        address,
                        timeStamp,
                        date: dateToString,
                        status: 'pending',
                        title: catName,
                        desc,
                        price: 300,
                        timeStarted: '',
                        timeDone: '',
                        timeSpent: '',
                      };
                      const seeker = {
                        seekerId: uid,
                        displayName,
                        email,
                        photoURL,
                        lat: latitude,
                        long: longitude,
                        seekerToken: token,
                        withMessage: 'false',
                      };
                      const insertData = {
                        postId: `${timeStamp}${uid}`,
                        metadata,
                        seeker,
                        runner: 'none',
                      };
                      updates[`/posts/${postId}`] = insertData;
                      updates[`/users/${uid}/currentPost`] = postId;
                      updates[`/users/${uid}/currentPostStatus`] = 'pending';
                      await firebase
                        .database()
                        .ref()
                        .update(updates);
                      const { navigate } = navigation;
                      this.setState({ loading: false });
                      this.storePostToLocalStorage(postId);
                      navigate('SeekerTabNavigator');
                    } catch (e) {
                      this.setState({ loading: false });
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
                          'Please try again. Sorry for having this issue, SugoPH team will look into this as soon as possible.',
                        );
                        firebase
                          .database()
                          .ref('errors')
                          .push(e.message);
                      }
                    }
                  } else {
                    this.setState({ loading: false });
                    Alert.alert(
                      'Location',
                      'To continue, please allow SugoPH to access your location.',
                    );
                  }
                } else {
                  this.setState({ loading: false });
                  Alert.alert('Connection Problem.', 'Please check your internet connection');
                }
              });
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  renderButton() {
    const { loading, desc } = this.state;
    const { btnSubmitStyle } = styles;
    let disabled = true;
    if (!(desc === '')) {
      disabled = false;
    }

    const backgroundColor = disabled ? '#FFCA85' : GLOBAL_STYLES.BRAND_COLOR;
    console.log('disabled', disabled);
    return loading ? (
      <View style={{ width: '100%' }}>
        <ProgressBarAndroid
          color={GLOBAL_STYLES.BRAND_COLOR}
          animating
          styleAttr="Horizontal"
          style={{ height: 50, width: '100%' }}
        />
      </View>
    ) : (
      <TouchableOpacity
        disabled={disabled}
        onPress={this.insertPost}
        style={[btnSubmitStyle, { backgroundColor }]}
      >
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{ fontSize: 20, color: 'white', fontWeight: '500' }}
        >
          Post it!
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { desc, loading } = this.state;
    const { container, headerContainerStyle, catNameStyle } = styles;
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    const { catName } = params;
    return (
      <View style={{ flex: 1 }}>
        <View style={headerContainerStyle}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
            <Ionicons
              onPress={() => navigation.goBack()}
              name="ios-arrow-back"
              size={40}
              color="#BDBDBD"
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {this.renderButton()}
          </View>
        </View>
        <View
          style={{
            borderColor: '#dddddd',
            borderWidth: 1,
            marginTop: 10,
            marginHorizontal: 25,
            padding: 7,
            borderRadius: 5,
            elevation: 1,
          }}
        >
          <Text adjustsFontSizeToFit numberOfLines={1} style={catNameStyle}>
            {catName}
          </Text>
          <TextInput
            style={{
              height: 250,
              color: 'gray',
              borderWidth: 0,
              padding: 10,
              fontSize: 16,
            }}
            placeholder="Enter Description"
            onChangeText={description => this.setState({ desc: description })}
            value={desc}
            textAlignVertical="top"
            multiline
            numberOfLines={8}
            editable={!loading}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 11,
    borderRadius: 13,
    shadowOpacity: 1,
    shadowOffset: { height: 1, width: 1 },
    shadowColor: 'gray',
    elevation: 1,
  },
  catNameStyle: {
    fontSize: 21,
    color: GLOBAL_STYLES.BRAND_COLOR,
    fontWeight: '300',
    alignSelf: 'center',
  },
  headerContainerStyle: {
    height: 60,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: getStatusBarHeight(),
    paddingHorizontal: 25,
  },
  img: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  descInputContainer: {
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    padding: 5,
  },
  inputStyle: {
    flex: 1,
    padding: 6,
    width: width - 20,
    textAlignVertical: 'top',
    fontSize: 20,
  },
  btnSubmitStyle: {
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  sendControlContainerOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
