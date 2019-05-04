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
} from 'react-native';
import t from 'tcomb-form-native';
import * as firebase from 'firebase';
import { Ionicons } from '@expo/vector-icons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Location, Permissions, IntentLauncherAndroid } from 'expo';
import { MONTHARRAY, GLOBAL_STYLES } from '../components/Constants';
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
          fontSize: 17,
          marginBottom: 7,
          fontWeight: '200',
          fontStyle: 'italic',
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
        // Price: {
        //   editable,
        //   autoFocus: true,
        //   label: 'Price (Minimum of 100 pesos)',
        //   error: 'Service fee should not be lower than 100 pesos.',
        //   // editable: this.state.editable,
        // },
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
                color: '#484848',
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

  // handleSubmit = () => {
  //   const value = this._form.getValue();
  // };

  storePostToLocalStorage = async postId => {
    try {
      await AsyncStorage.setItem('postId', postId);
    } catch (error) {
      this.setState({ loading: false });
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  };

  insertPost = () => {
    this.setState({ loading: true });
    const value = this._form.getValue();
    const desc = value.Description;
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
                  } Sorry for having this issue, SugoPH team will look into this as soon as possible.`,
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
    const { btnSubmitStyle } = styles;
    let disabled = true;
    if (!(price === '' || desc === '')) {
      disabled = false;
    }

    const backgroundColor = disabled ? '#FFCA85' : GLOBAL_STYLES.BRAND_COLOR;
    return loading ? (
      <View style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </View>
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
    const { container, headerContainerStyle } = styles;
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
            color="black"
          />
        </View>
        <View style={container}>
          <Text style={{ fontSize: 30, alignSelf: 'center' }}>{catName}</Text>
          <Form
            ref={c => {
              this._form = c;
            }}
            type={Post}
            options={options}
            value={value}
            onChange={val => this.setState({ value: val })}
          />
          <View style={{ marginTop: 10 }}>{this.renderButton()}</View>
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
