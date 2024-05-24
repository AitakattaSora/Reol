import { authToken, getAccessToken } from './getAccessToken';
import retry from 'async-retry';
import axios, { AxiosRequestConfig } from 'axios';

const spotifyClient = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

spotifyClient.interceptors.request.use(async (config) => {
  if (
    !authToken.accessToken ||
    !authToken.expiresAt ||
    Date.now() >= authToken.expiresAt
  ) {
    await getAccessToken();
  }

  config.headers['Authorization'] = authToken.accessToken;
  return config;
});

spotifyClient.interceptors.response.use(
  (response) => {
    const error = response.data.error;
    if (error) {
      throw new Error(`Spotify Error: ${error.message}`);
    }

    return response;
  },
  (error) => {
    const url = error.config.url;
    const params = error.config.params;
    const spotifyErrorMessage = error?.response?.data?.error?.message;
    const errorMessage =
      spotifyErrorMessage || error.message || 'Unknown error';

    return Promise.reject(
      `Error occurred at endpoint: ${url} with params: ${JSON.stringify(
        params
      )}. Error message: ${errorMessage}`
    );
  }
);

export async function spotifyFetch(url: string, config?: AxiosRequestConfig) {
  return await retry(
    async (bail) => {
      try {
        const response = await spotifyClient.get(url, config);

        return response.data;
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          error.message = `Spotify error: ${error.message}`;
          if (!error.response || error.response.status >= 500) {
            throw error;
          } else {
            bail(error);
          }
        }
        throw error;
      }
    },
    {
      retries: 2,
    }
  );
}
