/* @flow */

import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as firebase from 'firebase';
import { GLOBAL_STYLES, renderSugoLogo, getMomentAgo } from './Constants';

export default class PendingPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: '',
      momentAgo: 0,
    };
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.post !== newProps.post) {
      this.setState({ post: newProps.post }, () => {
        this.renderMomentAgo();
      });
    }
  }

  getPostObject = () => {
    const { postId } = this.props;
    const database = firebase.database();
    database.ref(`posts/${postId}`).once('value', snapshot => {
      this.setState({ post: snapshot.val() });
    });
  };

  renderMomentAgo = () => {
    const { post } = this.state;
    const { metadata } = post;
    const { timeStamp } = metadata;
    const initialTimeNow = new Date().getTime();
    const initialSeconds = (initialTimeNow - timeStamp) / 1000;
    this.setState({ momentAgo: getMomentAgo(initialSeconds) });
    if (post !== '') {
      this.countdownInterval = setInterval(async () => {
        const timeNow = new Date().getTime();
        const seconds = (timeNow - timeStamp) / 1000;
        this.setState({ momentAgo: getMomentAgo(seconds) });
      }, 60000);
    }
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
        <Text style={{ color: 'gray' }}>Cancel</Text>
      </TouchableOpacity>
    ) : null;
  };

  // <ScrollView style={scrollViewStyle}>
  //   <Text style={{ fontStyle: 'italic', color: 'gray' }}>
  //     {post !== '' ? post.metadata.desc : ''}
  //   </Text>
  // </ScrollView>

  render() {
    const { post, momentAgo } = this.state;
    const {
      headerContainer,
      headerImageStyle,
      headerImageContainer,
      sugoLogoStyle,
      titleContainerStyle,
      upperContainerStyle,
      lowerContainerStyle,
      upperRowContainerStyle,
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
            <View style={upperRowContainerStyle}>
              <View style={titleContainerStyle}>
                <Image source={renderSugoLogo(post.metadata.title)} style={sugoLogoStyle} />
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#4F4F4F;',
                }}
              >
                <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: 'gray' }}>
                  {post !== '' ? post.metadata.title : ''}
                </Text>
                <Text style={{ fontSize: 36, fontWeight: '400', color: 'gray' }}>{`₱${
                  post.metadata.price
                }.00`}</Text>
                <Text
                  style={{ fontSize: 16, color: GLOBAL_STYLES.BRAND_COLOR }}
                >{`${momentAgo} ago`}</Text>
              </View>
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
    height: 40,
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
    resizeMode: 'contain',
    flex: 1,
  },
  upperContainerStyle: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  upperRowContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    padding: 10,
    elevation: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
  },
  titleContainerStyle: {
    alignItems: 'center',
    backgroundColor: GLOBAL_STYLES.BRAND_COLOR,
    height: 60,
    width: 60,
    borderRadius: 7,
    overflow: 'hidden',
  },
  lowerContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  scrollViewStyle: {
    flex: 1,
  },
});
