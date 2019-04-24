import { createStackNavigator, createAppContainer } from 'react-navigation';
import Login from '../ScreenMutual/LoginScreen';
import SeekerTabNavigator from './SeekerTabNav';
import RunnerTabNavigator from './RunnerTabNav';
import AddPostScreen from '../ScreenSeeker/AddPostScreen';

const MainStackNavigator = createAppContainer(
  createStackNavigator(
    {
      LoginScreen: {
        screen: Login,
        navigationOptions: {
          header: null,
        },
      },
      SeekerTabNavigator: {
        screen: SeekerTabNavigator,
        navigationOptions: {
          header: null,
        },
      },
      RunnerTabNavigator: {
        screen: RunnerTabNavigator,
        navigationOptions: {
          header: null,
        },
      },
      AddPostScreen: {
        screen: AddPostScreen,
        navigationOptions: {
          headerStyle: {
            borderBottomColor: 'white',
            borderBottomWidth: 0,
            shadowOffset: { height: 0, width: 0 },
          },
        },
      },
      // ViewSugoScreen: {
      //   screen: ViewSugo,
      //   navigationOptions: {
      //     headerStyle: {
      //       borderBottomColor: 'white',
      //       borderBottomWidth: 0,
      //       shadowOffset: { height: 0, width: 0 },
      //       elevation: 0,
      //       shadowRadius: 0,
      //       shadowOpacity: 0,
      //       backgroundColor: 'transparent',
      //     },
      //   },
      // },
      // AddSugoScreen: {
      //   screen: AddSugo,
      //   navigationOptions: {
      //     headerStyle: {
      //       borderBottomColor: 'white',
      //       borderBottomWidth: 0,
      //       shadowOffset: { height: 0, width: 0 },
      //       elevation: 0,
      //       shadowRadius: 0,
      //       shadowOpacity: 0,
      //       backgroundColor: 'transparent',
      //     },
      //   },
      // },
    },
    {
      navigationOptions: {
        gestureEnabled: false,
      },
    },
  ),
);
export default MainStackNavigator;
