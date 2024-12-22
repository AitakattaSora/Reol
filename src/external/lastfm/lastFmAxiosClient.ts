import retry from 'async-retry';
import axios, { AxiosRequestConfig } from 'axios';
import { ENV } from '../../utils/ENV';

const lastFmClient = axios.create({
  baseURL: 'https://ws.audioscrobbler.com/2.0/?',
  params: {
    api_key: ENV.LASTFM_API_KEY,
    format: 'json',
  },
});

lastFmClient.interceptors.response.use(
  (response) => {
    const error = response.data.error;
    if (error) {
      throw new Error(`Last.fm error: ${error.message}`);
    }

    return response;
  },
  (error) => {
    const url = error.config.url;
    const params = error.config.params;
    const apiErrorMessage = error?.response?.data?.error?.message;
    const errorMessage = apiErrorMessage || error.message || 'Unknown error';

    return Promise.reject(
      `Error occurred at endpoint: ${url} with params: ${JSON.stringify(
        params
      )}. Error message: ${errorMessage}`
    );
  }
);

export async function lastFmFetch(method: string, config?: AxiosRequestConfig) {
  if (!process.env.LASTFM_API_KEY) {
    throw new Error('LASTFM_API_KEY is not set');
  }

  return await retry(
    async (bail) => {
      try {
        const response = await lastFmClient({
          params: {
            method,
            ...config?.params,
          },
        });

        return response.data;
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          error.message = `Last.fm error: ${error.message}`;
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
      retries: 0,
    }
  );
}
