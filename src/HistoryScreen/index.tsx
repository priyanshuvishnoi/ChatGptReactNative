import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Appbar, PaperProvider, useTheme} from 'react-native-paper';
import {Chat} from '../@types';
import * as DB from '../utils/db';
import {useNavigation} from '@react-navigation/native';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    getChats();
  }, []);

  const getChats = async () => {
    const db = await DB.getDB();
    await DB.createTable(db);
    await DB.getChats();
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{flex: 1}}>
        <Appbar.Header theme={theme}>
          <Appbar.Content title="History" />
          <Appbar.Action
            icon="plus"
            onPress={() => navigation.navigate('chat')}
          />
        </Appbar.Header>
        <View style={styles.container}>{/* <FlatList /> */}</View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
