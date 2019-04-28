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
import { MONTHARRAY, GLOBAL_STYLES } from '../components/constants/constants';
import { Spinner } from '../components/common/Spinner';

const { width } = Dimensions.get('window');
const { Form } = t.form;

const Price = t.refinement(t.Number, n => {
  return n >= 100;
});
const Post = t.struct({
  Price,
  Description: t.String,
});
const formStyles = {
  ...Form.stylesheet,
  formGroup: {
    normal: {
      marginBottom: 10,
    },
  },
  controlLabel: {
    normal: {
      color: GLOBAL_STYLES.BRAND_COLOR,
      fontSize: 21,
      marginBottom: 7,
      fontWeight: '600',
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
    Price: {
      autoFocus: true,
      label: 'Price (Minimum of 100 pesos)',
      error: 'Service fee should not be lower than 100 pesos.',
      // editable: this.state.editable,
    },
    Description: {
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
            height: 100,
            textAlignVertical: 'top',
            padding: 5,
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
export default class MyModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      loading: false,
    };
  }

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

  insertPost = (price, desc, lat, long, address) => {
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    console.log('params', params);
    const { id, name, email, photoUrl, catName } = params;
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
      price,
    };
    const seeker = {
      seekerId: id,
      name,
      email,
      photoUrl,
      lat,
      long,
      withMessage: 'false',
    };
    const insertData = {
      postId: `${timeStamp}${id}`,
      metadata,
      seeker,
      runner: 'none',
    };
    const postId = `${timeStamp}${id}`;
    const updates = {};
    updates[`/posts/${postId}`] = insertData;
    updates[`/users/${id}/currentPost`] = postId;
    updates[`/users/${id}/currentPostStatus`] = 'pending';
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
      const price = value.Price;
      this.getLatLongAsync()
        .then(loc => {
          const { longitude, latitude } = loc.coords;
          this.getAddressByLatLong(longitude, latitude)
            .then(add => {
              const addIndex = add[0];
              const { city, street, country } = addIndex;
              const address = `${street}, ${city}, ${country}`;
              this.insertPost(price, desc, latitude, longitude, address);
            })
            .catch(() => {
              this.setState({ loading: false });
              Alert.alert(
                'Fetching location failed',
                'Please try to turn on your GPS',
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
            'Fetching location failed',
            'Please try to turn on your GPS',
            [{ text: 'OK' }],
            {
              cancelable: false,
            },
          );
        });
    }
  };

  renderButton() {
    const { loading } = this.state;
    const { btnSubmitStyle } = styles;
    return loading ? (
      <Spinner size="small" />
    ) : (
      <TouchableOpacity onPress={this.onSubmitPost} style={btnSubmitStyle}>
        <Text style={{ color: 'white', fontSize: 20 }}>Submit</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { value } = this.state;
    const { container } = styles;
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    const { catName } = params;
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 30, color: 'gray', alignSelf: 'center' }}>{catName}</Text>
        <View style={container}>
          <Form
            ref={c => {
              this._form = c;
            }}
            type={Post}
            options={options}
            value={value}
            onChange={val => this.setState({ value: val })}
          />
          {this.renderButton()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
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
    marginVertical: 10,
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
    marginBottom: 10,
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
