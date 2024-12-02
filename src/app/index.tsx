import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ChatScreen from '../ChatScreen';
import {createStaticNavigation} from '@react-navigation/native';
import HistoryScreen from '../HistoryScreen';
import {RootStackParamList} from '../@types';

const RootStack = createNativeStackNavigator<RootStackParamList>({
  initialRouteName: 'history',
  // initialRouteName: 'chat',
  screens: {
    history: HistoryScreen,
    chat: ChatScreen,
  },
  screenOptions: {
    headerShown: false,
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
