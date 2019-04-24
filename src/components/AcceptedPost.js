/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight,
  Alert,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import { MapView } from 'expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import { Spinner } from './common/Spinner';
import { GLOBAL_STYLES, LOGO_URL } from '../constants/constants';
import MyModal from './Modal';

export default class AcceptedPost extends Component {
  constructor(props) {
    super(props);
    this.state = { post: '', isModalVisible: false };
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.post !== newProps.post) {
      this.setState({ post: newProps.post });
    }
  }

  onCancelButton = () => {
    const { post } = this.state;
    const { id, runner, seeker } = post;
    const runnerId = runner.id;
    const seekerId = seeker.id;
    const updates = {};
    updates[`/posts/${id}/metadata/status`] = 'cancelled';
    updates[`/users/${seekerId}/currentPost`] = '';
    updates[`/users/${seekerId}/currentPostStatus`] = 'none';
    updates[`/users/${runnerId}/currentPost`] = '';
    updates[`/users/${runnerId}/currentPostStatus`] = 'none';
    Alert.alert(
      'Warning',
      'Are you sure you want to cancel sugo?',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await firebase
                .database()
                .ref()
                .update(updates);
              await firebase
                .database()
                .ref(`posts/${id}`)
                .off();
              await AsyncStorage.removeItem('postId');
              this.setState({ post: '' });
            } catch (e) {
              Alert.alert('Connection Problem', 'Please try again', [{ text: 'OK' }], {
                cancelable: false,
              });
            }
          },
        },
        { text: 'Cancel' },
      ],
      {
        cancelable: false,
      },
    );
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  hideModal = () => {
    this.setState({ isModalVisible: false });
  };

  renderView() {
    const { post, isModalVisible } = this.state;
    const {
      img,
      imgContainer,
      runnerProfileContainer,
      runnerInfoContainer,
      messageIconContainer,
      runnerRowContainer,
      btnSubmitStyle,
    } = styles;

    return post ? (
      <View style={{ flex: 1 }}>
        <MyModal
          title={post.metadata.title}
          desc={post.metadata.desc}
          isVisible={isModalVisible}
          hideModal={this.hideModal}
        />
        <MapView
          style={{ flex: 1 }}
          region={{
            latitude: post.runner.lat,
            longitude: post.runner.long,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <MapView.Marker coordinate={{ latitude: post.runner.lat, longitude: post.runner.long }}>
            <Image
              source={{
                uri: post.runner.photoUrl || LOGO_URL,
              }}
              style={styles.circle}
            />
          </MapView.Marker>
        </MapView>
        <View style={{ height: 40, flexDirection: 'row', marginVertical: 10 }}>
          <TouchableOpacity
            onPress={this.onCancelButton}
            style={[btnSubmitStyle, { marginRight: 10, backgroundColor: 'red' }]}
          >
            <Text style={{ color: 'white' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.showModal}
            style={[btnSubmitStyle, { marginLeft: 10, backgroundColor: 'green' }]}
          >
            <Text style={{ color: 'white' }}>View Sugo Details</Text>
          </TouchableOpacity>
        </View>
        <View style={runnerProfileContainer}>
          <View style={imgContainer}>
            <Image
              source={{
                uri: post.runner.photoUrl || LOGO_URL,
              }}
              style={img}
            />
          </View>
          <View style={{ flex: 2 }}>
            <View style={runnerRowContainer}>
              <View style={{ flex: 3 }}>
                <View style={runnerInfoContainer}>
                  <Text>{post.runner.name}</Text>
                </View>
                <View style={runnerInfoContainer}>
                  <Text>{post.runner.email}</Text>
                </View>
              </View>
              <View style={messageIconContainer}>
                <AntDesign name="message1" size={32} color="gray" />
              </View>
            </View>
          </View>
        </View>
      </View>
    ) : (
      <Spinner />
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <TouchableHighlight
          style={{ position: 'absolute', right: 8, top: 8, elevation: 2 }}
          onPress={this.onCancelButton}
        >
          <Ionicons name="md-close-circle-outline" size={28} color="black" />
        </TouchableHighlight>
        {this.renderView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  runnerProfileContainer: {
    height: 70,
    flexDirection: 'row',
  },
  runnerRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  imgContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: 60,
    width: 60,
    borderColor: GLOBAL_STYLES.LIGHT_GREY_COLOR,
    borderWidth: 3,
    borderRadius: 30,
    marginHorizontal: 20,
  },
  runnerInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messageIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'red',
  },
  pinText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 10,
  },
  btnSubmitStyle: {
    backgroundColor: 'red',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
});
