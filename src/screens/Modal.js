import React, { Component } from 'react';
import {
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
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
      isModalVisible: false,
      loading: false,
    };
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.isModalVisible !== newProps.isModalVisible) {
      this.setState({ isModalVisible: newProps.isModalVisible });
    }
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

  insertPost = (title, desc, lat, long, address) => {
    const { id, name, email, photoUrl } = this.props;
    const timeStamp = new Date().getTime();
    const monthIndex = new Date().getMonth();
    const date = new Date().getDate().toString();
    const month = MONTHARRAY[monthIndex];
    const year = new Date().getFullYear();
    const dateToString = `${month} ${date}, ${year}`;
    const metadata = {
      lat,
      long,
      address,
      timeStamp,
      date: dateToString,
      status: 'Pending',
    };
    const seeker = {
      id,
      name,
      email,
      photoUrl,
    };
    const insertData = {
      id: `${timeStamp}${id}`,
      metadata,
      seeker,
      title,
      desc,
      runner: 'none',
      status: 'pending',
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
        this.setState({ desc: '' });
        this.setState({ isModalVisible: false });
        this.setState({ loading: false });
      })
      .catch(() =>
        Alert.alert('Connection Problem', 'Please try again', [{ text: 'OK' }], {
          cancelable: false,
        }),
      );
  };

  onSubmitPost = (title, desc) => {
    this.setState({ loading: true });
    this.getLatLongAsync()
      .then(loc => {
        const { longitude, latitude } = loc.coords;
        this.getAddressByLatLong(longitude, latitude)
          .then(add => {
            const addIndex = add[0];
            const { city, street, country } = addIndex;
            const address = `${street}, ${city}, ${country}`;
            this.insertPost(title, desc, latitude, longitude, address);
          })
          .catch(() =>
            Alert.alert('Fetching location failed', 'Please try again', [{ text: 'OK' }], {
              cancelable: false,
            }),
          );
      })
      .catch(() =>
        Alert.alert('Fetching location failed', 'Please try again', [{ text: 'OK' }], {
          cancelable: false,
        }),
      );
  };

  renderButton() {
    const { loading } = this.state;
    const { desc } = this.state;
    const { catName } = this.props;
    const { btnSubmitStyle } = styles;
    return loading ? (
      <View style={btnSubmitStyle}>
        <Spinner size="small" />
      </View>
    ) : (
      <TouchableOpacity onPress={() => this.onSubmitPost(catName, desc)} style={btnSubmitStyle}>
        <Text>Submit</Text>
      </TouchableOpacity>
    );
  }

  renderCloseButton() {
    const { loading } = this.state;
    const { modalClose } = this.props;
    return loading ? null : (
      <TouchableHighlight
        style={{ position: 'absolute', right: 8, top: 8, elevation: 2 }}
        onPress={modalClose}
      >
        <Ionicons name="md-close-circle-outline" size={28} color="black" />
      </TouchableHighlight>
    );
  }
  // onBackdropPress={modalClose}

  render() {
    const { desc, isModalVisible } = this.state;
    const { container, img, inputContainer, descInputStyle } = styles;
    const { catName, imageUri } = this.props;
    return (
      <Modal isVisible={isModalVisible} style={{ margin: 0 }}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{ flex: 1 }}>
          <View style={container}>
            <View
              style={{
                flex: 1,
              }}
            >
              <Image source={imageUri} style={img} />
            </View>
            {this.renderCloseButton()}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
              <View style={inputContainer}>
                <Text style={{ fontSize: 30, color: 'gray' }}>{catName}</Text>
                <TextInput
                  style={descInputStyle}
                  multiline
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
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddddd',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  img: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    margin: 10,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  descInputStyle: {
    flex: 1,
    width: width - 20,
    padding: 6,
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
