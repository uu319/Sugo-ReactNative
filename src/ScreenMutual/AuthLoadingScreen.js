import React from 'react';
import { AsyncStorage, StatusBar, View, Image } from 'react-native';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    const userToken = await AsyncStorage.getItem('user');
    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    navigate(userToken ? 'App' : 'Auth');
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../myassets/loading.gif')}
          resizeMode="contain"
          style={{
            width: 60,
            height: 60,
          }}
        />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}
