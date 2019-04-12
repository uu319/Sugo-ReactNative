import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, AsyncStorage } from 'react-native';
import { Location, Permissions } from 'expo';
import * as firebase from 'firebase';
import { Button, Spinner } from '../components/common';
import { GLOBAL_STYLES, MONTHARRAY } from '../components/constants/constants';

const { width } = Dimensions.get('window');
export default class AddSugo extends Component {
  constructor(props) {
    super(props);
    this.startAsync = true;
    this.state = {
      loading: false,
      error: '',
      id: '',
      name: '',
      email: '',
      title: '',
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    this.setState({ title: navigation.getParam('name', 'None') });
    this.retrieveUserAsync()
      .then(user => {
        const { id, name, email } = user;
        this.setState({
          id,
          name,
          email,
        });
      })
      .catch();
  }

  onPress = () => {
    const { navigation } = this.props;
    const { desc, title } = this.state;
    this.getLatLongAsync()
      .then(loc => {
        const { longitude, latitude } = loc.coords;
        console.log(loc);
        this.getAddressByLatLong(longitude, latitude)
          .then(add => {
            const addIndex = add[0];
            const { city, street, country } = addIndex;
            const address = `${street}, ${city}, ${country}`;
            this.insertPost(title, desc, latitude, longitude, address)
              .then(navigation.goBack())
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      })
      .catch(error => console.log(error));
  };

  insertPost = async (title, desc, lat, long, address) => {
    const { id, name, email } = this.state;
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
    };
    try {
      const database = await firebase
        .database()
        .ref('posts')
        .push({
          id: `${timeStamp}${id}`,
          metadata,
          seeker,
          title,
          desc,
          runner: 'none',
        });
      return database;
    } catch {
      console.log('error on firebase');
    }
    return null;
  };

  retrieveUserAsync = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } catch (error) {
      console.log('error on user');
    }
    return null;
  };

  getLatLongAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});
        // console.log('location',location);
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

  renderButton() {
    const { loading } = this.state;
    return loading ? (
      <Spinner size="large" />
    ) : (
      <View style={{ flex: 1, width: width - 20 }}>
        <View style={{ marginBottom: 10 }}>
          <Button buttonStyle={{ marginLeft: 0, marginRight: 0 }} onPress={this.onPress}>
            Post Sugo
          </Button>
        </View>
      </View>
    );
  }

  render() {
    const { title, desc, error } = this.state;
    const { errorTextStyle, descInputStyle, container, inputContainer, inputLabel } = styles;
    return (
      <View style={container}>
        <View style={inputContainer}>
          <Text style={inputLabel}>{title}</Text>
        </View>
        <View style={inputContainer}>
          <Text style={inputLabel}>Please describe your Sugo</Text>
          <TextInput
            style={descInputStyle}
            multiline
            numberOfLines={4}
            placeholder="Description"
            underlineColorAndroid="transparent"
            onChangeText={description => this.setState({ desc: description })}
            value={desc}
          />
        </View>
        <Text style={errorTextStyle}>{error}</Text>
        {this.renderButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 10,
  },
  inputContainer: {
    // margin: 10,
    flexDirection: 'column',
  },
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red',
  },
  descInputStyle: {
    width: width - 20,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 10,
    padding: 6,
    textAlignVertical: 'top',
    fontSize: 20,
    height: 200,
  },
  titleInputStyle: {
    width: width - 20,
    flexDirection: 'row',
    borderColor: GLOBAL_STYLES.BRAND_COLOR,
    borderWidth: 2,
    borderRadius: 10,
    padding: 6,
    textAlignVertical: 'top',
    fontSize: 20,
    height: 40,
  },
  inputLabel: {
    fontSize: 25,
    color: 'black',
    alignSelf: 'center',
    marginBottom: 7,
  },
});
