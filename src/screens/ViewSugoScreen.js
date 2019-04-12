import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import _ from 'lodash';
import * as firebase from 'firebase';
import { MapView } from 'expo';
import { GLOBAL_STYLES, LOGO_URL } from '../constants/constants';

class ViewSugo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: {},
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    const post = navigation.getParam('post', 'none');
    this.setState({ post });
    const { id } = post;
    this.refreshDetails(id);
  }

  refreshDetails(id) {
    const database = firebase.database();
    database
      .ref(`posts`)
      .orderByChild('id')
      .equalTo(id)
      .on('value', snapshot => {
        const data = _.values(snapshot.val());
        this.setState({ post: data[0] });
      });
  }

  render() {
    const { post } = this.state;
    const { desc, metadata, title, runner } = post;
    const { date } = metadata;
    const { email, name, photoUrl, lat, long } = runner;
    const {
      container,
      bottomContainer,
      titleDescContainer,
      rowTypeContainer,
      mapViewContainer,
    } = styles;
    return (
      <SafeAreaView style={container}>
        <View style={mapViewContainer}>
          <MapView
            style={{ flex: 1 }}
            region={{
              latitude: lat,
              longitude: long,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <MapView.Marker
              coordinate={{
                latitude: lat,
                longitude: long,
              }}
              title="Sample"
              description="Sample"
            />
          </MapView>
        </View>
        <View style={bottomContainer}>
          <ScrollView style={titleDescContainer}>
            <View style={rowTypeContainer}>
              <Text>Date: </Text>
              <Text>{date}</Text>
            </View>
            <View style={rowTypeContainer}>
              <Text>Category: </Text>
              <Text>{title}</Text>
            </View>
            <View style={rowTypeContainer}>
              <Text>Description: </Text>
              <Text>{desc}</Text>
            </View>
          </ScrollView>
          <View style={{ borderWidth: 0.5, borderColor: '#dddddd', marginHorizontal: 10 }} />
          <View style={styles.runnerProfileContainer}>
            <Image
              source={{
                uri: photoUrl || LOGO_URL,
              }}
              style={styles.img}
            />
            <View style={styles.runnerNameStyle}>
              <Text style={{ fontSize: 22 }}>{name}</Text>
              <Text>{email}</Text>
            </View>
            <View style={{ marginRight: 20 }}>
              <AntDesign name="message1" size={24} color="gray" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapViewContainer: {
    flex: 3,
  },
  bottomContainer: {
    flex: 1,
  },
  titleDescContainer: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 20,
  },
  runnerProfileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTypeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  img: {
    height: 50,
    width: 50,
    borderColor: GLOBAL_STYLES.LIGHT_GREY_COLOR,
    borderWidth: 3,
    borderRadius: 25,
    marginHorizontal: 20,
  },
  runnerNameStyle: {
    flex: 1,
    justifyContent: 'center',
  },
});
export default ViewSugo;
