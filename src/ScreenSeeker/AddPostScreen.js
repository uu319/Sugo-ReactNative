import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  Alert,
  AsyncStorage,
} from 'react-native';
import t from 'tcomb-form-native';
import * as firebase from 'firebase';
import { Location, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
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
          color: 'black',
          fontSize: 21,
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

  storePostToLocalStorage = async postId => {
    try {
      await AsyncStorage.setItem('postId', postId);
    } catch (error) {
      this.setState({ loading: false });
      Alert.alert('error on storeUserToFirebase');
    }
  };

  insertPost = (desc, lat, long, address) => {
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    const { uid, displayName, email, photoURL, catName } = params;
    const timeStamp = new Date().getTime();
    const monthIndex = new Date().getMonth();
    const date = new Date().getDate().toString();
    const month = MONTHARRAY[monthIndex];
    const year = new Date().getFullYear();
    const dateToString = `${month} ${date}, ${year}`;
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
      lat,
      long,
      withMessage: 'false',
    };
    const insertData = {
      postId: `${timeStamp}${uid}`,
      metadata,
      seeker,
      runner: 'none',
    };
    const postId = `${timeStamp}${uid}`;
    const updates = {};
    updates[`/posts/${postId}`] = insertData;
    updates[`/users/${uid}/currentPost`] = postId;
    updates[`/users/${uid}/currentPostStatus`] = 'pending';
    return firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        const { navigate } = navigation;
        this.setState({ loading: false });
        this.storePostToLocalStorage(postId);
        navigate('SeekerTabNavigator');
      })
      .catch(() =>
        Alert.alert('Connection Problem', 'Please try again', [{ text: 'OK' }], {
          cancelable: false,
        }),
      );
  };

  onSubmitPost = () => {
    const value = this._form.getValue(); // use that ref to get the form value
    if (value) {
      this.setState({ loading: true });
      const desc = value.Description;
      // const price = value.Price;
      this.getLatLongAsync()
        .then(loc => {
          const { longitude, latitude } = loc.coords;
          this.getAddressByLatLong(longitude, latitude)
            .then(add => {
              const addIndex = add[0];
              const { city, street, country } = addIndex;
              const address = `${street}, ${city}, ${country}`;
              this.insertPost(desc, latitude, longitude, address);
            })
            .catch(() => {
              this.setState({ loading: false });
              Alert.alert(
                'Something went wrong.',
                'Please check your internet connection or turn your GPS/Location on',
                [{ text: 'OK' }],
                {
                  cancelable: false,
                },
              );
            });
        })
        .catch(() => {
          this.setState({ loading: false });
          Alert.alert(
            'Error',
            'Please check your internet connection or turn your GPS/Location on',
            [{ text: 'OK' }],
            {
              cancelable: false,
            },
          );
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
    // const disabled = (price || desc) === '';
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
        onPress={this.onSubmitPost}
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
            color="#BDBDBD"
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
