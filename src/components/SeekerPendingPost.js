/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as firebase from 'firebase';
import { GLOBAL_STYLES } from './Constants';

export default class PendingPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postObject: null,
    };
  }

  componentDidMount() {
    this.getPostObject();
  }

  getPostObject = () => {
    const { postId } = this.props;
    const database = firebase.database();
    database.ref(`posts/${postId}`).once('value', snapshot => {
      this.setState({ postObject: snapshot.val() });
    });
  };

  onCancelSugo = async () => {
    const { postObject } = this.state;
    const { postId, seeker } = postObject;
    const { seekerId } = seeker;
    const updates = {};
    updates[`/posts/${postId}/metadata/status`] = 'cancelled';
    updates[`/users/${seekerId}/currentPostStatus`] = 'none';
    updates[`/users/${seekerId}/currentPost`] = '';
    const database = firebase.database();
    Alert.alert(
      'Warning',
      'Are you sure you want to cancel sugo?',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await database.ref().update(updates);
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

  renderCancelButton = () => {
    const { postObject } = this.state;
    const { btnCancelStyle } = styles;
    return postObject ? (
      <TouchableOpacity onPress={this.onCancelSugo} style={btnCancelStyle}>
        <Text style={{ color: 'white', fontSize: 20 }}>Cancel</Text>
      </TouchableOpacity>
    ) : null;
  };

  render() {
    const { headerContainer, headerImageStyle, headerImageContainer } = styles;
    return (
      <View style={{ flex: 1 }}>
        <View style={headerContainer}>
          <View style={headerImageContainer}>
            <Image source={require('../myassets/sugoLogoOrange.png')} style={headerImageStyle} />
          </View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Image
            source={require('../myassets/pending.gif')}
            resizeMode="contain"
            style={{
              width: 60,
              height: 60,
            }}
          />
          <Text style={{ fontSize: 13, color: '#8597A4' }}>Waiting for Runner</Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {this.renderCancelButton()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  btnCancelStyle: {
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
    height: 40,
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    alignSelf: 'center',
    elevation: 1.3,
  },
  headerContainer: {
    height: 70,
    backgroundColor: 'white',
  },
  headerImageContainer: {
    flex: 1,
    margin: 10,
  },
  headerImageStyle: {
    width: null,
    height: null,
    resizeMode: 'contain',
    flex: 1,
  },
});
