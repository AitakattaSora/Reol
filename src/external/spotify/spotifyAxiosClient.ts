import { authToken, getAccessToken } from './getAccessToken';
import axios from 'axios';

export async function createAxiosClient() {
  const axiosClient = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosClient.interceptors.request.use(
    async (config) => {
      if (
        !authToken.accessToken ||
        !authToken.expiresAt ||
        Date.now() >= authToken.expiresAt
      ) {
        await getAccessToken();
      }

      config.headers['Authorization'] = authToken.accessToken;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use((response) => {
    const error = response.data.error;
    if (error) {
      throw new Error(error.message);
    }

    return response;
  });

  return axiosClient;
}
