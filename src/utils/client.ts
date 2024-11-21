import axios from 'axios';
const OPENAI_API_KEY =
  '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';

const client = axios.create({
    baseURL: 'https://api.openai.com/v1/chat/completions',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
    },
})

export default client;