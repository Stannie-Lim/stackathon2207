const router = require('express').Router();
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('querystring');

dotenv.config();

module.exports = router;

// root route is /api
router.get('/', async (req, res, next) => {
  const scopes = ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state", "user-read-playback-state"].join('%20');
    try {
      const authUrl = `https://accounts.spotify.com/authorize?client_id=${ process.env.SPOTIFY_CLIENT_ID }&response_type=code&scope=${ scopes }&redirect_uri=${ encodeURIComponent(process.env.URL + '/api/auth/callback') }`;
      res.redirect(authUrl);
    } catch(err) {
      next(err);
    }
});

router.get('/callback', async(req, res, next) => {
  const { code } = req.query;
  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.URL + '/api/auth/callback',
  };
  try {
    const base64 = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const { access_token, refresh_token } = (await axios.post(`https://accounts.spotify.com/api/token`, qs.stringify(body), { 
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${base64}`,
      }
    })).data;
    res.redirect(`${process.env.URL}/#/${access_token}/${refresh_token}`);
  } catch(err) {
    next(err);
  }
});