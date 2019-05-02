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
import Modal from 'react-native-modal';
import { ImagePicker } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { timeTo12HrFormat, sendNotification } from './Constants';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      post: props.post,
      userId: '',
      textMessage: '',
      messageList: [],
      type: '',
      loading: false,
    };
  }

  async componentDidMount() {
    const { post } = this.state;
    const { postId } = post;
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
    const { post, userId, type } = this.state;
    const { postId, runner, seeker } = post;
    const { runnerToken } = runner;
    const { seekerToken } = seeker;
    let token = '';
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
        token = seekerToken;
      } else {
        token = runnerToken;
        updates[`posts/${postId}/runner/withMessage`] = 'true';
      }
      updates[`messages/${postId}/ ${msgId}`] = message;
      await this.database.ref().update(updates);
      sendNotification(token, 'Message', msg);
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
      <View style={{ flex: 1, margin: 10 }}>
        <View
          style={{
            width: '60%',
            height: 150,
            alignSelf: item.from === userId ? 'flex-end' : 'flex-start',
            borderRadius: 5,
            // borderColor: 'gray',
            // borderWidth: 0.5,
            marginTop: 4,
          }}
        >
          <Image
            resizeMode="contain"
            source={{ uri: item.message }}
            style={{ flex: 1, width: null, height: null, borderRadius: 5 }}
          />
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
    );
  };

  renderFlatList = () => {
    const { type } = this.state;
    const { loading, messageList } = this.state;
    const typeText = type === 'seeker' ? 'Runner' : 'Seeker';
    return loading ? (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image source={require('../myassets/message.png')} style={{ width: 100, height: 100 }} />
        <Text style={{ fontSize: 30, color: '#dddddd' }}>Say Hi To Your {typeText}</Text>
      </View>
    ) : (
      <FlatList
        inverted
        style={{ height: '100%', backgroundColor: 'white' }}
        data={messageList}
        renderItem={this.renderRow}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  onBackPress = () => {
    const { type, post } = this.state;
    const { postId } = post;
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
    const { hideModal, isVisible } = this.props;
    return (
      <Modal
        animationOut="slideOutLeft"
        isVisible={isVisible}
        style={{ margin: 0, backgroundColor: 'white' }}
      >
        <View style={container}>
          <View style={headerContainerStyle}>
            <Ionicons
              onPress={() => {
                this.onBackPress();
                hideModal();
              }}
              name="ios-arrow-back"
              size={40}
              color="black"
            />
            <Text style={{ fontSize: 30, fontWeight: '600', marginLeft: 20 }}>Chats</Text>
          </View>
          {this.renderFlatList()}
          <View
            style={{
              padding: 10,
              backgroundColor: 'white',
            }}
          >
            <KeyboardAvoidingView
              style={inputContainerStyle}
              keyboardVerticalOffset={-200}
              behavior="padding"
            >
              <TouchableOpacity onPress={this._pickImage} style={sendButtonStyle}>
                <Ionicons name="md-photos" size={32} color="#33A1DE" />
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
                <Ionicons name="md-send" size={32} color="#33A1DE" />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    borderRadius: 30,
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
    height: 75,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: 'white',
  },
});
