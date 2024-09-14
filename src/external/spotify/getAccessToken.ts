import axios from 'axios';
import { ENV } from '../../utils/ENV';

interface AuthToken {
  accessToken: string | null;
  expiresAt: number | null;
}

export const authToken: AuthToken = {
  accessToken: null,
  expiresAt: null,
};

export async function getAccessToken() {
  try {
    const clientId = ENV.SPOTIFY_CLIENT_ID;
    const clientSecret = ENV.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Spotify client ID or client secret is not defined.');
    }

    const basicToken =
      'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        method: 'POST',
        headers: {
          Authorization: basicToken,
        },
      }
    );

    const { token_type, access_token, expires_in } = response.data;

    authToken.accessToken = `${token_type} ${access_token}`;
    authToken.expiresAt = Date.now() + expires_in * 1000 - 60000; // Refresh 1 minute before expiry
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error in Spotify API request:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }

    throw error;
  }
}
