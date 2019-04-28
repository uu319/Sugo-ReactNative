import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapView } from 'expo';
import { AntDesign } from '@expo/vector-icons';
import { GLOBAL_STYLES, LOGO_URL } from '../constants/constants';
import MyModal from './SeekerSugoDetailsModal';
import Loading from './Loading';

export default class CurrentSugo extends Component {
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

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  hideModal = () => {
    this.setState({ isModalVisible: false });
  };

  renderView() {
    const { post, isModalVisible } = this.state;
    const { postId } = post;
    const { navProp } = this.props;
    const {
      img,
      imgContainer,
      seekerProfileContainer,
      seekerNameContainer,
      seekerEmailContainer,
      messageIconContainer,
      seekerRowContainer,
      btnSubmitStyle,
    } = styles;

    return post ? (
      <View style={{ flex: 1, marginHorizontal: 6 }}>
        <MyModal
          title={post.metadata.title}
          desc={post.metadata.desc}
          isVisible={isModalVisible}
          hideModal={this.hideModal}
        />
        <MapView
          style={{ flex: 1 }}
          region={{
            latitude: post.seeker.lat,
            longitude: post.seeker.long,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <MapView.Marker coordinate={{ latitude: post.seeker.lat, longitude: post.seeker.long }}>
            <Image
              source={{
                uri: post.seeker.photoUrl || LOGO_URL,
              }}
              style={styles.circle}
            />
          </MapView.Marker>
        </MapView>
        <View style={{ height: 40, flexDirection: 'row', marginVertical: 10 }}>
          <TouchableOpacity onPress={this.showModal} style={btnSubmitStyle}>
            <Text style={{ color: 'white' }}>View Sugo Details</Text>
          </TouchableOpacity>
        </View>
        <View style={seekerProfileContainer}>
          <View style={imgContainer}>
            <Image
              source={{
                uri: post.seeker.photoUrl || LOGO_URL,
              }}
              style={img}
            />
          </View>
          <View style={{ flex: 2 }}>
            <View style={seekerRowContainer}>
              <View style={{ flex: 3 }}>
                <View style={seekerNameContainer}>
                  <Text style={{ fontSize: 20 }}>{post.seeker.name}</Text>
                </View>
                <View style={seekerEmailContainer}>
                  <Text>{post.seeker.email}</Text>
                </View>
              </View>
              <View style={messageIconContainer}>
              {this.renderMessageBadge()}
                <AntDesign
                  onPress={() => navProp.navigate('ChatApp', { postId })}
                  name="message1"
                  size={32}
                  color="gray"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    ) : (
      <Loading />
    );
  }

  renderMessageBadge = () => {
    const { post } = this.state;
    const { runner } = post;
    const { withMessage } = runner;
    return withMessage === 'true' ? (
      <View
        style={{
          height: 12,
          width: 12,
          borderRadius: 6,
          backgroundColor: 'red',
          position: 'absolute',
          top: 15,
          right: 20,
          elevation: 2,
        }}
      />
    ) : null;
  };

  render() {
    return <View style={{ flex: 1 }}>{this.renderView()}</View>;
  }
}

const styles = StyleSheet.create({
  seekerProfileContainer: {
    height: 70,
    flexDirection: 'row',
  },
  seekerRowContainer: {
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
  seekerNameContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  seekerEmailContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
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
    backgroundColor: 'green',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
});
