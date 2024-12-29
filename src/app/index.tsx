import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Appearance } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import 'reflect-metadata';
import type { RootStackParamList } from '../@types';
import ChatScreen from '../ChatScreen';
import { InputDialog } from '../components/InputDialog';
import { initDB } from '../db';
import HistoryScreen from '../HistoryScreen';
import { setDialogOpen } from '../redux/slices/commonSlice';
import { setTheme } from '../redux/slices/themeSlice';
import { AppDispatch, RootState, store } from '../redux/store';


const RootStack = createNativeStackNavigator<RootStackParamList>({
  id: undefined,
  initialRouteName: 'history',
  screens: {
    history: HistoryScreen,
    chat: ChatScreen,
  },
});

function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const commonState = useSelector((state: RootState) => state.common);

  useEffect(() => {
    AsyncStorage.getItem('OPENAI_API_KEY').then(value => {
      if (!value) {
        dispatch(setDialogOpen(true))
      }
    })

    const listener = Appearance.addChangeListener(({ colorScheme }) =>
      dispatch(setTheme(colorScheme)),
    );

    initDB();
    return () => listener.remove();
  }, []);

  return (
    <>
      <InputDialog
        title="Enter your OpenAI API key"
        visible={commonState.isDialogOpen}
        onSubmit={value => {
          if (!value) return;
          AsyncStorage.setItem('OPENAI_API_KEY', value);
          dispatch(setDialogOpen(false))
        }}
      />
      <RootStack.Navigator screenOptions={{ headerShown: false }} id={undefined}>
        <RootStack.Screen name="history" component={HistoryScreen} />
        <RootStack.Screen name="chat" component={ChatScreen} />
      </RootStack.Navigator>
    </>
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
