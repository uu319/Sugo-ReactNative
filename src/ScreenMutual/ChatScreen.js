/* @flow */

import React, { Component } from 'react';
import * as firebase from 'firebase';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  AsyncStorage,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Image,
} from 'react-native';
import { ImagePicker } from 'expo';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Ionicons } from '@expo/vector-icons';
import { timeTo12HrFormat, GLOBAL_STYLES } from '../components/Constants';
import Loading from '../components/Loading';

export default class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      postId: props.navigation.getParam('postId', 'none'),
      userId: '',
      textMessage: '',
      messageList: [],
      type: '',
      loading: false,
    };
  }

  async componentDidMount() {
    const { postId } = this.state;
    const user = await AsyncStorage.getItem('user');
    const type = await AsyncStorage.getItem('type');
    const parsedUser = JSON.parse(user);
    const { uid } = parsedUser;
    this.setState({ userId: uid, type, loading: true });
    this.database.ref(`messages/${postId}`).on('child_added', value => {
      this.setState({ loading: false });
      this.setState(prevState => {
        return {
          messageList: [value.val(), ...prevState.messageList],
        };
      });
    });
  }

  handleChange = key => val => {
    this.setState({ [key]: val });
  };

  convertTime = time => {
    const d = new Date(time);
    const c = new Date();
    let result = `${d.getHours() < 10 ? '0' : ''} ${d.getHours()}:`;
    result += `${d.getMinutes() < 10 ? '0' : ''} ${d.getMinutes()}`;
    if (c.getDay() !== d.getDay()) {
      result = `${d.getDay()} ${d.getMonth()} ${result}`;
    }
    return result;
  };

  _pickImage = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async pickerResult => {
    try {
      if (!pickerResult.cancelled) {
        await this.uploadImageAsync(pickerResult.uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Upload failed, sorry :(');
    }
  };

  uploadImageAsync = async uri => {
    const { postId } = this.state;
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
    const timeStamp = new Date().getTime();
    const ref = firebase
      .storage()
      .ref()
      .child(`images/${postId}/${timeStamp}`);
    const snapshot = await ref.put(blob);

    // We're done with the blob, close and release it
    blob.close();
    try {
      const getDownloadURL = await snapshot.ref.getDownloadURL();
      this.sendMessage('image', getDownloadURL);
    } catch (e) {
      Alert.alert('Something went wrong, please try again');
    }
  };

  sendMessage = async (msgType, msg) => {
    const { postId, userId, type } = this.state;
    if (msg.length > 0) {
      const msgId = await this.database
        .ref('messages')
        .child(postId)
        .push().key;
      const updates = {};
      const message = {
        message: msg,
        time: firebase.database.ServerValue.TIMESTAMP,
        from: userId,
        msgType,
      };
      if (type === 'runner') {
        updates[`posts/${postId}/seeker/withMessage`] = 'true';
      } else {
        updates[`posts/${postId}/runner/withMessage`] = 'true';
      }
      updates[`messages/${postId}/ ${msgId}`] = message;
      await this.database.ref().update(updates);
      this.setState({ textMessage: '' });
    }
  };

  renderRow = ({ item }) => {
    const { userId } = this.state;
    console.log('rooow', item);
    return item.msgType === 'text' ? (
      <View style={{ flex: 1, margin: 10 }}>
        <View
          style={{
            width: '60%',
            alignSelf: item.from === userId ? 'flex-end' : 'flex-start',
            backgroundColor: item.from === userId ? '#00897b' : '#7cb342',
            borderRadius: 5,
            padding: 10,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>{item.message}</Text>
        </View>
        <Text
          style={{
            color: '#828282',
            fontSize: 11,
            alignSelf: item.from === userId ? 'flex-end' : 'flex-start',
          }}
        >
          {timeTo12HrFormat(this.convertTime(item.time))}
        </Text>
      </View>
    ) : (
      <View
        style={{
          width: '60%',
          height: 150,
          alignSelf: item.from === userId ? 'flex-end' : 'flex-start',
          borderRadius: 5,
          borderColor: 'gray',
          borderWidth: 0.5,
          marginTop: 4,
        }}
      >
        <Image
          resizeMode="contain"
          source={{ uri: item.message }}
          style={{ flex: 1, width: null, height: null, borderRadius: 5 }}
        />
        <Text
          style={{
            color: '#828282',
            fontSize: 11,
            alignSelf: item.from === userId ? 'flex-end' : 'flex-start',
          }}
        >
          {timeTo12HrFormat(this.convertTime(item.time))}
        </Text>
      </View>
    );
  };

  renderFlatList = () => {
    const { loading, messageList } = this.state;
    const { height } = Dimensions.get('window');
    return loading ? (
      <Loading />
    ) : (
      <FlatList
        inverted
        style={{ padding: 10, height: height * 0.8 }}
        data={messageList}
        renderItem={this.renderRow}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  onBackPress = () => {
    const { navigation } = this.props;
    const { type, postId } = this.state;
    navigation.goBack();
    console.log('back', postId);
    console.log('type', type);
    const updates = {};
    if (type === 'seeker') {
      updates[`posts/${postId}/seeker/withMessage`] = 'false';
    } else {
      updates[`posts/${postId}/runner/withMessage`] = 'false';
    }
    this.database.ref().update(updates);
  };

  render() {
    const { textMessage } = this.state;
    const {
      container,
      inputStyle,
      sendButtonStyle,
      inputContainerStyle,
      headerContainerStyle,
    } = styles;
    return (
      <SafeAreaView style={container}>
        <View style={headerContainerStyle}>
          <Ionicons onPress={this.onBackPress} name="ios-arrow-back" size={40} color="#BDBDBD" />
        </View>
        {this.renderFlatList()}
        <KeyboardAvoidingView
          style={inputContainerStyle}
          keyboardVerticalOffset={14}
          behavior="padding"
        >
          <TouchableOpacity onPress={this._pickImage} style={sendButtonStyle}>
            <Ionicons name="md-photos" size={32} color="black" />
          </TouchableOpacity>
          <TextInput
            style={inputStyle}
            value={textMessage}
            placeHolder="Type message"
            onChangeText={this.handleChange('textMessage')}
          />
          <TouchableOpacity
            onPress={() => this.sendMessage('text', textMessage)}
            style={sendButtonStyle}
          >
            <Ionicons name="md-send" size={32} color="black" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 10,
    borderTopWidth: 0.5,
    borderColor: 'gray',
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR
  },
  inputStyle: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 4,
    borderRadius: 5,
    marginBottom: 10,
  },
  sendButtonStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnTextStyle: {
    color: 'darkblue',
    fontSize: 20,
  },
  headerContainerStyle: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    paddingLeft: 20,
    marginTop: getStatusBarHeight(),
  },
});
