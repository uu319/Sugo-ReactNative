import React from 'react';
import * as firebase from 'firebase';
import { AppLoading, Asset, Font, Notifications } from 'expo';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  AntDesign,
  FontAwesome,
  Alert,
} from '@expo/vector-icons';
import SwitchNav from './src/navigators/MainNav';
import { firebaseConfig } from './src/components/Constants';

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  cacheFonts = fonts => {
    return fonts.map(font => Font.loadAsync(font));
  };

  _loadResourcesAsync = async () => {
    const imageAssets = Asset.loadAsync([
      require('./src/myassets/sugoBillsPayment.png'),
      require('./src/myassets/sugoGrocery.png'),
      require('./src/myassets/sugoDocuments.png'),
      require('./src/myassets/sugoDelivery.png'),
      require('./src/myassets/sugoOthers.png'),
      require('./src/myassets/sugoHousehold.png'),
      require('./src/myassets/sugoLogoOrange.png'),
    ]);

    // const iosSearch = Font.loadAsync([Ionicons['ios-search']]);
    const ionIcons = this.cacheFonts([Ionicons.font]);
    const materialIconsCommunity = this.cacheFonts([MaterialCommunityIcons.font]);
    const fontAwesome = this.cacheFonts([FontAwesome.font]);
    const materialIcons = this.cacheFonts([MaterialIcons.font]);
    const antDesign = this.cacheFonts([AntDesign.font]);
    return Promise.all([
      imageAssets,
      ionIcons,
      materialIconsCommunity,
      materialIcons,
      antDesign,
      fontAwesome,
    ]);
  };

  _handleLoadingError = error => {
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  render() {
    const { isLoadingComplete } = this.state;
    const { skipLoadingScreen } = this.props;
    if (!isLoadingComplete && !skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    }
    return <SwitchNav />;
  }
}
