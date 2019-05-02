import { Alert } from 'react-native';
import { Location, Permissions } from 'expo';

export const firebaseConfig = {
  apiKey: 'AIzaSyAh5Xa9P-6vpzMMML1Y-55Pt71M8cfED8I',
  authDomain: 'sugoph-11fb0.firebaseapp.com',
  databaseURL: 'https://sugoph-11fb0.firebaseio.com',
  projectId: 'sugoph-11fb0',
  storageBucket: 'sugoph-11fb0.appspot.com',
  messagingSenderId: '93206224262',
};

export const googleSigninConfig = {
  clientId: '544798728580-couhsh39kje50v7892sub1olhsojmmuo.apps.googleusercontent.com',
  // behavior: 'web',
  // androidClientId: '544798728580-jhcqp16k0e82qto9f0rq4bgq5ranhece.apps.googleusercontent.com',
  // iosClientId: '544798728580-qq2lg7duolvmbj1ps5s5d7bkkag4eklm.apps.googleusercontent.com',
  // iosStandaloneAppClientId:
  //   '544798728580-qq2lg7duolvmbj1ps5s5d7bkkag4eklm.apps.googleusercontent.com',
  // androidStandaloneAppClientId:
  //   '544798728580-jhcqp16k0e82qto9f0rq4bgq5ranhece.apps.googleusercontent.com',
  // scopes: ['profile', 'email'],
  // webClientId: '544798728580-couhsh39kje50v7892sub1olhsojmmuo.apps.googleusercontent.com',
};

export const GLOBAL_STYLES = {
  BRAND_COLOR: '#F39F33',
  SECONDARY_COLOR: '#e2be2d',
  DARK_GREY_COLOR: '#6C7A89',
  LIGHT_GREY_COLOR: '#B0B0B0',
  FONT_STYLE: 'Helvetica',
};

export const LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/sugoph-11fb0.appspot.com/o/SugoPh-Logo-noBackground.png?alt=media&token=a28e65bd-fdee-43eb-9a6d-e1e015feb3ee';

export const MONTHARRAY = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export function getMomentAgo(milliseconds) {
  let momentAgo = '';
  const seconds = milliseconds / 1000;
  const minutes = seconds / 60;
  const hour = minutes / 60;
  const day = hour / 24;

  if (seconds < 60) {
    momentAgo = `${Math.round(seconds)} sec`;
  } else if (seconds > 60 && minutes < 60) {
    momentAgo = `${Math.round(minutes)} min`;
  } else if (minutes > 60 && hour < 24) {
    momentAgo = `${Math.round(hour)} hr`;
  } else if (hour > 24) {
    momentAgo = `${Math.round(day)} days`;
  }
  return momentAgo;
}

export function renderSugoLogo(title) {
  if (title === 'Grocery') {
    return require('../myassets/sugoGrocery.png');
  }
  if (title === 'Pickup / Delivery') {
    return require('../myassets/sugoDelivery.png');
  }
  if (title === 'Filing/Claiming of Documents') {
    return require('../myassets/sugoDocuments.png');
  }
  if (title === 'Bills Payment') {
    return require('../myassets/sugoBillsPayment.png');
  }
  if (title === 'Household Chores') {
    return require('../myassets/sugoHousehold.png');
  }
  return require('../myassets/sugoOthers.png');
}

export function timeTo12HrFormat(time) {
  // Take a time in 24 hour format and format it in 12 hour format
  const timePartArray = time.split(':');
  let ampm = 'AM';

  if (timePartArray[0] >= 12) {
    ampm = 'PM';
  }

  if (timePartArray[0] > 12) {
    timePartArray[0] -= 12;
  }

  const formattedTime = `${timePartArray[0]}:${timePartArray[1]} ${ampm}`;
  return formattedTime;
}

export function sendNotification(token, title, body) {
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      title,
      body,
    }),
  });
}

export async function getLatLongAsync() {
  const { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status === 'granted') {
    try {
      const location = await Location.getCurrentPositionAsync({});
      return location;
    } catch {
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  }
  return null;
}

export async function getAddressByLatLong(longitude, latitude) {
  try {
    const address = await Location.reverseGeocodeAsync({ longitude, latitude });
    return address;
  } catch {
    Alert.alert('Error', 'Something went wrong, please try again.');
  }
  return null;
}
