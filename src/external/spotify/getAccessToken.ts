import axios from 'axios';
import { ENV } from '../../utils/ENV';

export async function getAccessToken() {
  try {
    const clientId = ENV.SPOTIFY_CLIENT_ID;
    const clientSecret = ENV.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Spotify client ID or client secret is not defined.');
    }

    const authToken =
      'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        method: 'POST',
        headers: {
          Authorization: authToken,
        },
      }
    );

    const { token_type, access_token } = response.data;

    return `${token_type} ${access_token}`;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error in API request:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }

    throw error;
  }
}
