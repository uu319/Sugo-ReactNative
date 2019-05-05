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
  Image,
} from 'react-native';
import t from 'tcomb-form-native';
import { Location, Permissions, IntentLauncherAndroid } from 'expo';
import * as firebase from 'firebase';
import { Ionicons } from '@expo/vector-icons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { MONTHARRAY, GLOBAL_STYLES, renderSugoLogo } from '../components/Constants';
import { Spinner } from '../components/common/Spinner';

const { width } = Dimensions.get('window');
const { Form } = t.form;
// const Price = t.refinement(t.Number, n => {
//   return n >= 100;
// });
const Post = t.struct({
  // Price,
  Description: t.String,
});

export default class MyModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {},
      value: {
        Description: '',
        // Price: '',
      },
      loading: false,
    };
  }

  componentDidMount() {
    this.initializeForm();
  }

  initializeForm = () => {
    const { loading } = this.state;
    const editable = !loading;
    console.log('editable', editable);
    const formStyles = {
      ...Form.stylesheet,
      formGroup: {
        normal: {
          marginBottom: 10,
        },
      },
      controlLabel: {
        normal: {
          color: 'gray',
          fontSize: 14,
          marginBottom: 7,
          fontWeight: '300',
        },
        // the style applied when a validation error occours
        error: {
          color: GLOBAL_STYLES.BRAND_COLOR,
          fontSize: 18,
          marginBottom: 7,
          fontWeight: '600',
        },
      },
    };

    const options = {
      fields: {
        Description: {
          editable,
          multiline: true,
          stylesheet: {
            ...formStyles,
            error: {
              color: 'red',
              fontSize: 18,
              marginBottom: 7,
              fontWeight: '600',
            },
            textbox: {
              ...Form.stylesheet.textbox,
              normal: {
                ...Form.stylesheet.textbox.normal,
                height: 130,
                textAlignVertical: 'top',
                padding: 10,
                backgroundColor: 'white',
              },
            },
          },
          numberOfLines: 5,
          textAlignVertical: 'top',
          error: 'Please describe your sugo.',
        },
      },
      stylesheet: formStyles,
    };
    this.setState({ options });
  };

  handleSubmit = () => {
    const value = this._form.getValue();
    console.log('value: ', value);
  };

  storePostToLocalStorage = async postId => {
    try {
      await AsyncStorage.setItem('postId', postId);
    } catch (error) {
      this.setState({ loading: false });
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  };

  insertPost = () => {
    const value = this._form.getValue();
    const desc = value.Description;
    this.setState({ loading: true });
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    const { uid, displayName, email, photoURL, catName, token } = params;
    const timeStamp = new Date().getTime();
    const monthIndex = new Date().getMonth();
    const date = new Date().getDate().toString();
    const month = MONTHARRAY[monthIndex];
    const year = new Date().getFullYear();
    const dateToString = `${month} ${date}, ${year}`;
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
                  `${
                    e.message
                  } Please try again. Sorry for having this issue, SugoPH team will look into this as soon as possible.`,
                );
              }
            }
          } else {
            this.setState({ loading: false });
            Alert.alert('Location', 'To continue, please allow SugoPH to access your location.');
          }
        } else {
          this.setState({ loading: false });
          Alert.alert('Connection Problem.', 'Please check your internet connection');
        }
      });
    }
  };

  renderButton() {
    const { loading, value } = this.state;
    const price = value.Price;
    const desc = value.Description;
    console.log('pricedesc', `${price}${desc}`);
    const { btnSubmitStyle } = styles;
    let disabled = true;
    if (!(price === '' || desc === '')) {
      disabled = false;
    }

    const backgroundColor = disabled ? '#FFCA85' : GLOBAL_STYLES.BRAND_COLOR;
    console.log('disabled', disabled);
    return loading ? (
      <Spinner />
    ) : (
      <TouchableOpacity
        disabled={disabled}
        onPress={this.insertPost}
        style={[btnSubmitStyle, { backgroundColor }]}
      >
        <Text style={{ color: 'white', fontSize: 20 }}>Submit</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { value, options } = this.state;
    const { container, headerContainerStyle, catNameStyle } = styles;
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    const { catName } = params;
    return (
      <View style={{ flex: 1 }}>
        <View style={headerContainerStyle}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="ios-arrow-back"
            size={40}
            color="#BDBDBD"
          />
        </View>
        <View style={container}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={renderSugoLogo(catName)}
              style={{ height: 30, width: 30, borderRadius: 5, marginRight: 7 }}
            />
            <Text adjustsFontSizeToFit style={catNameStyle}>
              {catName}
            </Text>
          </View>
          <Form
            ref={c => {
              this._form = c;
            }}
            type={Post}
            options={options}
            value={value}
            onChange={val => this.setState({ value: val })}
          />
          <View
            style={{ marginTop: 10, height: 40, justifyContent: 'center', alignItems: 'center' }}
          >
            {this.renderButton()}
          </View>
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
    alignSelf: 'center',
  },
  headerContainerStyle: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    paddingLeft: 20,
    marginTop: getStatusBarHeight(),
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
  priceInputContainer: {
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 4,
    height: 50,
    alignItems: 'center',
    marginVertical: 10,
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
    height: 40,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    alignSelf: 'center',
  },
  sendControlContainerOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
