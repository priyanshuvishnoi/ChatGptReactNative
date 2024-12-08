import secrets from '../../secrets.json';

import axios from 'axios';
const OPENAI_API_KEY = secrets.OPENAI_API_KEY;
const client = axios.create({
  baseURL: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
});

export default client;
