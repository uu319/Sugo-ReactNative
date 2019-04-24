import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  AsyncStorage,
} from 'react-native';
import * as firebase from 'firebase';
import { Location, Permissions } from 'expo';
import { MONTHARRAY } from '../components/constants/constants';
import { Spinner } from '../components/common/Spinner';

const { width } = Dimensions.get('window');
export default class MyModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      desc: '',
      price: '',
      loading: false,
      editable: true,
    };
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
      id,
      name,
      email,
      photoUrl,
      lat,
      long,
    };
    const insertData = {
      id: `${timeStamp}${id}`,
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
        this.setState({ loading: false, editable: true, desc: '', price: '' });
        this.storePostToLocalStorage(postId);
        navigate('SeekerTabNavigator');
      })
      .catch(() =>
        Alert.alert('Connection Problem', 'Please try again', [{ text: 'OK' }], {
          cancelable: false,
        }),
      );
  };

  onSubmitPost = (price, desc) => {
    this.setState({ loading: true, editable: false });
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
            this.setState({ loading: false, editable: true });
            Alert.alert('Fetching location failed', 'Pl', [{ text: 'OK' }], {
              cancelable: false,
            });
          });
      })
      .catch(() => {
        this.setState({ loading: false, editable: true });
        Alert.alert('Fetching location failed', 'Pl', [{ text: 'OK' }], {
          cancelable: false,
        });
      });
  };

  renderButton() {
    const { loading } = this.state;
    const { price, desc } = this.state;
    const { btnSubmitStyle } = styles;
    return loading ? (
      <View style={btnSubmitStyle}>
        <Spinner size="small" />
      </View>
    ) : (
      <TouchableOpacity onPress={() => this.onSubmitPost(price, desc)} style={btnSubmitStyle}>
        <Text>Submit</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { desc, price, editable } = this.state;
    const { container, descInputContainer, inputStyle, priceInputContainer } = styles;
    const { navigation } = this.props;
    const params = navigation.getParam('params', 'none');
    const { catName } = params;
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{ flex: 1 }}>
        <View style={container}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : ''}
            enabled
          >
            <Text style={{ fontSize: 30, color: 'gray', alignSelf: 'center' }}>{catName}</Text>
            <View style={priceInputContainer}>
              <TextInput
                keyboardType="numeric"
                style={inputStyle}
                multiline
                editable={editable}
                numberOfLines={1}
                placeholder="How much are you paying for the service?"
                underlineColorAndroid="transparent"
                onChangeText={priceInput => this.setState({ price: priceInput })}
                value={price}
              />
            </View>
            <View style={descInputContainer}>
              <TextInput
                style={inputStyle}
                multiline
                editable={editable}
                numberOfLines={1}
                placeholder="Description"
                underlineColorAndroid="transparent"
                onChangeText={description => this.setState({ desc: description })}
                value={desc}
              />
            </View>
            {this.renderButton()}
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
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
    backgroundColor: 'white',
    height: 40,
    marginHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  sendControlContainerOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
