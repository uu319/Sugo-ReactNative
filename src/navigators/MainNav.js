import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import Login from '../ScreenMutual/LoginScreen';
import SeekerTabNavigator from './SeekerTabNav';
import RunnerTabNavigator from './RunnerTabNav';
import AddPostScreen from '../ScreenSeeker/AddPostScreen';
import AuthLoadingScreen from '../ScreenMutual/AuthLoadingScreen';
import TypeLoadingScreen from '../ScreenMutual/TypeLoadingScreen';
import ChatApp from '../ScreenMutual/ChatScreen';

const AppStack = createAppContainer(
  createStackNavigator(
    {
      TypeLoading: {
        screen: TypeLoadingScreen,
        navigationOptions: {
          gesturesEnabled: false,
          header: null,
        },
      },
      SeekerTabNavigator: {
        screen: SeekerTabNavigator,
        navigationOptions: {
          gesturesEnabled: false,
          header: null,
        },
      },
      RunnerTabNavigator: {
        screen: RunnerTabNavigator,
        navigationOptions: {
          gesturesEnabled: false,
          header: null,
        },
      },
      AddPostScreen: {
        screen: AddPostScreen,
        navigationOptions: {
          gesturesEnabled: false,
          header: null,
        },
      },
      ChatApp: {
        screen: ChatApp,
        navigationOptions: {
          gesturesEnabled: false,
          header: null,
        },
      },
    },
    {
      navigationOptions: {
        gestureEnabled: false,
      },
    },
    {
      initialRouteName: 'TyoeLoading',
    },
  ),
);
const AuthStack = createStackNavigator({
  LoginScreen: {
    screen: Login,
    navigationOptions: {
      header: null,
    },
  },
});

const SwitchNav = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    },
  ),
);
export default SwitchNav;
