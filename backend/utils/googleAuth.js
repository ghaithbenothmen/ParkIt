const axios = require('axios');

exports.getAccessToken = async (req, res) => {
  const tokenUrl = 'https://oauth2.googleapis.com/token'; // Google OAuth2 token endpoint
  const clientId = process.env.GOOGLE_CLIENT_ID; // Using the correct env variable
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET; // Using the correct env variable
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN; // Using the correct env variable

  try {
    const response = await axios.post(tokenUrl, new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }));

    const { access_token } = response.data;
    console.log('Access Token:', access_token);
    return access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response ? error.response.data : error.message);
    throw error;
  }
};
