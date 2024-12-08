import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {Appearance} from 'react-native';
import {Provider, useDispatch} from 'react-redux';
import {RootStackParamList} from '../@types';
import ChatScreen from '../ChatScreen';
import HistoryScreen from '../HistoryScreen';
import {setTheme} from '../redux/slices/themeSlice';
import {store} from '../redux/store';

const RootStack = createNativeStackNavigator<RootStackParamList>({
  initialRouteName: 'history',
  screens: {
    history: HistoryScreen,
    chat: ChatScreen,
  },
});

const AppNavigator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const listener = Appearance.addChangeListener(({colorScheme}) =>
      dispatch(setTheme(colorScheme)),
    );
    return () => listener.remove();
  }, []);

  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      <RootStack.Screen name="history" component={HistoryScreen} />
      <RootStack.Screen name="chat" component={ChatScreen} />
    </RootStack.Navigator>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
