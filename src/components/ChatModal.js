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
  Platform
} from 'react-native';
import Modal from 'react-native-modal';
import { Constants, ImagePicker, Notifications, Permissions } from 'expo';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Ionicons } from '@expo/vector-icons';
import { timeTo12HrFormat } from './Constants';
import Loading from './Loading';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.database = firebase.database();
    this.state = {
      postId: props.postId,
      userId: '',
      textMessage: '',
      messageList: [],
      type: '',
      loading: false,
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('chat-messages', {
        name: 'Chat messages',
        sound: true,
      });
    }
    // const result = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    //
    // if (Constants.isDevice && result.status === 'granted') {
    //   console.log('Notification permissions granted.');
    // }
    //
    // // If we want to do something with the notification when the app
    // // is active, we need to listen to notification events and
    // // handle them in a callback
    // Notifications.addListener(this.handleNotification);

    const { postId } = this.state;
    const user = await AsyncStorage.getItem('user');
    const type = await AsyncStorage.getItem('type');
    const parsedUser = JSON.parse(user);
    const { uid } = parsedUser;
    this.setState({ userId: uid, type, loading: true });
    this.database.ref(`messages/${postId}`).on('child_added', value => {
      if (!(value.val().from === uid)) {
        this.testNotify();
      }
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

  testNotify = () => {
    const localNotification = {
      title: 'New Message Received',
      color: 'red',
      android: {
        channelId: 'chat-messages',
        sound: true,
      },
    };

    Notifications.presentLocalNotificationAsync(localNotification);
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
      <View style={{ flex: 1, margin: 10 }}>
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
    const { type, postId } = this.state;
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
    const { hideModal, isVisible } = this.props;
    return (
      <Modal
        animationOut="slideOutLeft"
        isVisible={isVisible}
        style={{ margin: 0, backgroundColor: 'white' }}
      >
        <SafeAreaView style={container}>
          <View style={headerContainerStyle}>
            <Text style={{ fontSize: 30 }}>Chats</Text>
            <Ionicons
              onPress={() => {
                this.onBackPress();
                hideModal();
              }}
              name="ios-arrow-back"
              size={40}
              color="#BDBDBD"
            />
          </View>
          {this.renderFlatList()}
          <KeyboardAvoidingView
            style={inputContainerStyle}
            keyboardVerticalOffset={-200}
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
    backgroundColor: '#dddddd',
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
