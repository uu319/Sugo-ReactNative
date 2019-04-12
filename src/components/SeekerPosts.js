import React, { Component } from 'react';
import { Text, View } from 'react-native';
import * as firebase from 'firebase';
import { Button } from './common';

class PostListItems extends Component {
  onDeleteItem = () => {
    const { post } = this.props;
    const { timeStamp } = post.metadata;
    const { name } = post.seeker;
    const database = firebase.database();
    database.ref(`posts/${timeStamp}${name}`).set(null);
  };

  onEditItem = () => {
    const { post } = this.props;
    const { timeStamp } = post.metadata;
    const { name } = post.seeker;
    const { desc, title } = post;
    const { navigationProps } = this.props;
    const { navigate } = navigationProps;
    navigate('AddSugoScreen', { title, desc, name, timeStamp });
  };

  viewRunnerProfile = () => {
    const { post } = this.props;
    const { name, email, photoUrl } = post.runner;
    const { navigationProps } = this.props;
    const { navigate } = navigationProps;
    navigate('RunnerProfileScreen', { name, email, photoUrl });
  };

  onViewPress = () => {
    const { navigationProps, post } = this.props;
    const { navigate } = navigationProps;
    navigate('ViewSugoScreen', { post });
  };

  render() {
    const { titleStyle, dateStyle, buttonStyle, buttonTextStyle } = styles;
    const { post } = this.props;
    const { date, status } = post.metadata;
    const { title } = post;
    return (
      <View style={{ flex: 1, flexDirection: 'row', padding: 14 }}>
        <View style={{ flex: 1, borderColor: 'black', borderWidth: 1 }}>
          <Text style={titleStyle}>{title}</Text>
          <Text style={dateStyle}>{date}</Text>
        </View>
        {status !== 'Accepted' ? (
          <Text>{status}</Text>
        ) : (
          <Button onPress={this.onViewPress} textStyle={buttonTextStyle} buttonStyle={buttonStyle}>
            View
          </Button>
        )}
      </View>
    );
  }
}
const styles = {
  dateStyle: {
    fontSize: 13,
    color: 'gray',
    flex: 1,
  },
  titleStyle: {
    color: 'black',
    fontSize: 18,
    flex: 3,
  },
  buttonStyle: {
    flex: 1,
    backgroundColor: 'green',
    paddingHorizontal: 10,
    marginLeft: 0,
    marginRight: 0,
    borderWidth: 0,
  },
  buttonTextStyle: {
    color: 'white',
    paddingTop: 0,
    paddingBottom: 0,
  },
};
export default PostListItems;
