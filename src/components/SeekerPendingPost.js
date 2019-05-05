/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as firebase from 'firebase';
import { GLOBAL_STYLES, renderSugoLogo } from './Constants';

export default class PendingPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: '',
    };
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.post !== newProps.post) {
      this.setState({ post: newProps.post });
    }
  }

  getPostObject = () => {
    const { postId } = this.props;
    const database = firebase.database();
    database.ref(`posts/${postId}`).once('value', snapshot => {
      this.setState({ post: snapshot.val() });
    });
  };

  onCancelSugo = async () => {
    const { post } = this.state;
    const { postId, seeker } = post;
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
    const { post } = this.state;
    const { btnCancelStyle } = styles;
    return post ? (
      <TouchableOpacity onPress={this.onCancelSugo} style={btnCancelStyle}>
        <Text style={{ color: 'white', fontSize: 20 }}>Cancel</Text>
      </TouchableOpacity>
    ) : null;
  };

  render() {
    const { post } = this.state;
    const {
      headerContainer,
      headerImageStyle,
      headerImageContainer,
      scrollViewStyle,
      sugoLogoStyle,
      titleContainerStyle,
      upperContainerStyle,
      lowerContainerStyle,
    } = styles;
    return (
      <View style={{ flex: 1 }}>
        <View style={headerContainer}>
          <View style={headerImageContainer}>
            <Image source={require('../myassets/sugoLogoOrange.png')} style={headerImageStyle} />
          </View>
        </View>
        <View style={upperContainerStyle}>
          {post !== '' ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <View style={titleContainerStyle}>
                <Image source={renderSugoLogo(post.metadata.title)} style={sugoLogoStyle} />
                <Text>{post !== '' ? post.metadata.title : ''}</Text>
              </View>
              <ScrollView style={scrollViewStyle}>
                <Text style={{ fontStyle: 'italic', color: 'gray' }}>
                  {post !== '' ? post.metadata.desc : ''}
                </Text>
              </ScrollView>
            </View>
          ) : null}
        </View>
        <View style={lowerContainerStyle}>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('../myassets/pending.gif')}
              resizeMode="contain"
              style={{
                width: 60,
                height: 60,
              }}
            />
            <Text style={{ fontSize: 13, color: '#8597A4', marginBottom: 20 }}>
              Waiting for Runner
            </Text>
          </View>
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
  sugoLogoStyle: {
    height: 20,
    width: 20,
    borderRadius: 5,
    marginRight: 5,
  },
  upperContainerStyle: {
    height: '30%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lowerContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollViewStyle: {
    flex: 1,
  },
});
