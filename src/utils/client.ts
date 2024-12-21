import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

export async function getClient() {
  const openApiKey = await AsyncStorage.getItem('OPENAI_API_KEY');
  return axios.create({
    baseURL: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openApiKey}`,
    },
  });
}