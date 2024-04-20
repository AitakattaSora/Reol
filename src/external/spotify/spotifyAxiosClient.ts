import { getAccessToken } from './getAccessToken';
import axios from 'axios';

let token: string | null = null;

export async function createAxiosClient() {
  let accessToken = token || (await getAccessToken());
  token = accessToken;

  const axiosClient = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {
      Authorization: accessToken,
      'Content-Type': 'application/json',
    },
  });

  axiosClient.interceptors.request.use((config) => {
    const params = config.params;
    if (params) {
      console.log('params', params);
    }

    return config;
  });

  axios.interceptors.response.use((response) => {
    const error = response.data.error;
    if (error) {
      throw new Error(error.message);
    }

    return response;
  });

  return axiosClient;
}
