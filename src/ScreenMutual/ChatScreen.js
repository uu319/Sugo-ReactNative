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
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Ionicons } from '@expo/vector-icons';

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
    };
  }

  async componentDidMount() {
    const { postId } = this.state;
    const user = await AsyncStorage.getItem('user');
    const type = await AsyncStorage.getItem('type');
    const parsedUser = JSON.parse(user);
    const { uid } = parsedUser;
    this.setState({ userId: uid, type });
    this.database.ref(`messages/${postId}`).on('child_added', value => {
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

  sendMessage = async () => {
    const { textMessage, postId, userId, type } = this.state;
    if (textMessage.length > 0) {
      const msgId = await this.database
        .ref('messages')
        .child(postId)
        .push().key;
      const updates = {};
      const message = {
        message: textMessage,
        time: firebase.database.ServerValue.TIMESTAMP,
        from: userId,
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
    return (
      <View
        style={{
          width: '60%',
          alignSelf: item.from === userId ? 'flex-end' : 'flex-start',
          backgroundColor: item.from === userId ? '#00897b' : '#7cb342',
          margin: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: '#eee', padding: 3, fontSize: 11 }}>
          {this.convertTime(item.time)}
        </Text>
        <Text style={{ color: '#fff', padding: 7, fontSize: 16 }}>{item.message}</Text>
      </View>
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
    const { textMessage, messageList } = this.state;
    const { height } = Dimensions.get('window');
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
        <FlatList
          inverted
          style={{ padding: 10, height: height * 0.8 }}
          data={messageList}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => index.toString()}
        />
        <KeyboardAvoidingView
          style={inputContainerStyle}
          keyboardVerticalOffset={14}
          behavior="padding"
        >
          <TextInput
            style={inputStyle}
            value={textMessage}
            placeHolder="Type message"
            onChangeText={this.handleChange('textMessage')}
          />
          <TouchableOpacity onPress={this.sendMessage} style={sendButtonStyle}>
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
