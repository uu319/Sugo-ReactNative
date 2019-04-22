/* @flow */

import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MapView } from 'expo';
import { AntDesign } from '@expo/vector-icons';
import { Spinner } from './common/Spinner';
import { GLOBAL_STYLES, LOGO_URL } from '../constants/constants';

export default class AcceptedPost extends Component {
  constructor(props) {
    super(props);
    this.state = { post: '' };
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.post !== newProps.post) {
      this.setState({ post: newProps.post });
    }
  }
  // <Text>{post.desc}</Text>
  // <Text>{post.metadata.address}</Text>
  // <Text>{post.metadata.date}</Text>
  // <Text>{post.metadata.lat}</Text>
  // <Text>{post.metadata.long}</Text>
  // <Text>{post.metadata.status}</Text>
  // <Text>{post.metadata.timeStamp}</Text>

  renderView() {
    const { post } = this.state;
    const {
      img,
      imgContainer,
      runnerProfileContainer,
      runnerInfoContainer,
      messageIconContainer,
      runnerRowContainer,
    } = styles;

    return post ? (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          region={{
            latitude: 10,
            longitude: 123,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
        <View style={runnerProfileContainer}>
          <View style={imgContainer}>
            <Image
              source={{
                uri: post.seeker.photoUrl || LOGO_URL,
              }}
              style={img}
            />
          </View>
          <View style={{ flex: 2 }}>
            <View style={runnerRowContainer}>
              <View style={{ flex: 3 }}>
                <View style={runnerInfoContainer}>
                  <Text>{post.seeker.name}</Text>
                </View>
                <View style={runnerInfoContainer}>
                  <Text>{post.seeker.email}</Text>
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
    return <View style={{ flex: 1 }}>{this.renderView()}</View>;
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
});
