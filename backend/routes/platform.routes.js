const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { LinkedAccount } = require('../models');
const { verifyJWT } = require('../middleware/auth');

// Short-lived, purpose-scoped state token — carries the user's id (and,
// for Twitter, the PKCE code_verifier) through the redirect to the
// platform and back, without needing server-side session storage.
const signState = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10m' });

const verifyState = (state) => jwt.verify(state, process.env.JWT_SECRET);

const saveLinkedAccount = async ({ userId, platform, username, platformUserId, accessToken, refreshToken }) => {
  const existing = await LinkedAccount.findOne({ where: { userId, platform } });
  const data = {
    username, platformUserId, accessToken, refreshToken,
    isActive: true, isVerified: true, verifiedAt: new Date(), lastSynced: new Date()
  };
  if (existing) {
    await existing.update(data);
  } else {
    await LinkedAccount.create({ userId, platform, ...data });
  }
};

// ==================== FACEBOOK ====================

router.get('/oauth/facebook/init', verifyJWT, (req, res) => {
  try {
    const state = signState({ id: req.user.id });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/facebook/callback`;
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,email&state=${state}`;
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Facebook OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start Facebook connection' });
  }
});

router.get('/oauth/facebook/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: fbError } = req.query;
    if (fbError || !code || !state) return res.redirect(`${frontendBase}?error=Facebook`);

    const { id: userId } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/facebook/callback`;

    const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: redirectUri,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        code
      }
    });
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get('https://graph.facebook.com/me', {
      params: { fields: 'id,name', access_token: accessToken }
    });

    await saveLinkedAccount({
      userId, platform: 'Facebook',
      username: profileRes.data.name, platformUserId: profileRes.data.id, accessToken
    });

    res.redirect(`${frontendBase}?connected=Facebook`);
  } catch (error) {
    console.error('Facebook OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=Facebook`);
  }
});

// ==================== INSTAGRAM ====================
// Uses Instagram's own login flow (separate app product from Facebook
// Login, but can share the same Meta App ID/Secret if Instagram Basic
// Display / Instagram Login is added as a product on that same app).

router.get('/oauth/instagram/init', verifyJWT, (req, res) => {
  try {
    const state = signState({ id: req.user.id });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/instagram/callback`;
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile&response_type=code&state=${state}`;
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Instagram OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start Instagram connection' });
  }
});

router.get('/oauth/instagram/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: igError } = req.query;
    if (igError || !code || !state) return res.redirect(`${frontendBase}?error=Instagram`);

    const { id: userId } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/instagram/callback`;

    const params = new URLSearchParams();
    params.append('client_id', process.env.INSTAGRAM_APP_ID);
    params.append('client_secret', process.env.INSTAGRAM_APP_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);
    params.append('code', code);

    const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', params);
    const { access_token: accessToken, user_id: platformUserId } = tokenRes.data;

    const profileRes = await axios.get(`https://graph.instagram.com/${platformUserId}`, {
      params: { fields: 'id,username', access_token: accessToken }
    });

    await saveLinkedAccount({
      userId, platform: 'Instagram',
      username: profileRes.data.username, platformUserId, accessToken
    });

    res.redirect(`${frontendBase}?connected=Instagram`);
  } catch (error) {
    console.error('Instagram OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=Instagram`);
  }
});

// ==================== YOUTUBE (Google) ====================

router.get('/oauth/youtube/init', verifyJWT, (req, res) => {
  try {
    const state = signState({ id: req.user.id });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/youtube/callback`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly')}&access_type=online&state=${state}`;
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('YouTube OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start YouTube connection' });
  }
});

router.get('/oauth/youtube/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: ytError } = req.query;
    if (ytError || !code || !state) return res.redirect(`${frontendBase}?error=YouTube`);

    const { id: userId } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/youtube/callback`;

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code
    });
    const accessToken = tokenRes.data.access_token;

    const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: { part: 'snippet', mine: true },
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const channel = channelRes.data.items?.[0];

    await saveLinkedAccount({
      userId, platform: 'YouTube',
      username: channel?.snippet?.title || 'YouTube User',
      platformUserId: channel?.id,
      accessToken,
      refreshToken: tokenRes.data.refresh_token
    });

    res.redirect(`${frontendBase}?connected=YouTube`);
  } catch (error) {
    console.error('YouTube OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=YouTube`);
  }
});

// ==================== SPOTIFY ====================

router.get('/oauth/spotify/init', verifyJWT, (req, res) => {
  try {
    const state = signState({ id: req.user.id });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/spotify/callback`;
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('user-read-private user-read-email')}&state=${state}`;
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Spotify OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start Spotify connection' });
  }
});

router.get('/oauth/spotify/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: spError } = req.query;
    if (spError || !code || !state) return res.redirect(`${frontendBase}?error=Spotify`);

    const { id: userId } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/spotify/callback`;

    const basicAuth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    const tokenRes = await axios.post('https://accounts.spotify.com/api/token', params, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    await saveLinkedAccount({
      userId, platform: 'Spotify',
      username: profileRes.data.display_name || profileRes.data.id,
      platformUserId: profileRes.data.id,
      accessToken,
      refreshToken: tokenRes.data.refresh_token
    });

    res.redirect(`${frontendBase}?connected=Spotify`);
  } catch (error) {
    console.error('Spotify OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=Spotify`);
  }
});

// ==================== TIKTOK ====================

router.get('/oauth/tiktok/init', verifyJWT, (req, res) => {
  try {
    const state = signState({ id: req.user.id });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/tiktok/callback`;
    const authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user.info.basic&response_type=code&state=${state}`;
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('TikTok OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start TikTok connection' });
  }
});

router.get('/oauth/tiktok/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: ttError } = req.query;
    if (ttError || !code || !state) return res.redirect(`${frontendBase}?error=TikTok`);

    const { id: userId } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/tiktok/callback`;

    const params = new URLSearchParams();
    params.append('client_key', process.env.TIKTOK_CLIENT_KEY);
    params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);

    const tokenRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token: accessToken, open_id: platformUserId, refresh_token: refreshToken } = tokenRes.data;

    const profileRes = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      params: { fields: 'display_name' },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    await saveLinkedAccount({
      userId, platform: 'TikTok',
      username: profileRes.data.data?.user?.display_name || 'TikTok User',
      platformUserId, accessToken, refreshToken
    });

    res.redirect(`${frontendBase}?connected=TikTok`);
  } catch (error) {
    console.error('TikTok OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=TikTok`);
  }
});

// ==================== TWITTER / X ====================
// X requires PKCE. The code_verifier is generated at /init and carried
// through the signed state token to /callback (no server-side session).

router.get('/oauth/twitter/init', verifyJWT, (req, res) => {
  try {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    const state = signState({ id: req.user.id, cv: codeVerifier });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/twitter/callback`;

    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('tweet.read users.read offline.access')}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Twitter OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start Twitter connection' });
  }
});

router.get('/oauth/twitter/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: twError } = req.query;
    if (twError || !code || !state) return res.redirect(`${frontendBase}?error=Twitter`);

    const { id: userId, cv: codeVerifier } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/twitter/callback`;

    const basicAuth = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);
    params.append('code_verifier', codeVerifier);

    const tokenRes = await axios.post('https://api.twitter.com/2/oauth2/token', params, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    await saveLinkedAccount({
      userId, platform: 'Twitter',
      username: profileRes.data.data?.username,
      platformUserId: profileRes.data.data?.id,
      accessToken,
      refreshToken: tokenRes.data.refresh_token
    });

    res.redirect(`${frontendBase}?connected=Twitter`);
  } catch (error) {
    console.error('Twitter OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=Twitter`);
  }
});

// ==================== LINKEDIN ====================

router.get('/oauth/linkedin/init', verifyJWT, (req, res) => {
  try {
    const state = signState({ id: req.user.id });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/linkedin/callback`;
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('openid profile email')}&state=${state}`;
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('LinkedIn OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start LinkedIn connection' });
  }
});

router.get('/oauth/linkedin/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: liError } = req.query;
    if (liError || !code || !state) return res.redirect(`${frontendBase}?error=LinkedIn`);

    const { id: userId } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/linkedin/callback`;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('client_id', process.env.LINKEDIN_CLIENT_ID);
    params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET);

    const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    await saveLinkedAccount({
      userId, platform: 'LinkedIn',
      username: profileRes.data.name || profileRes.data.given_name,
      platformUserId: profileRes.data.sub,
      accessToken
    });

    res.redirect(`${frontendBase}?connected=LinkedIn`);
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=LinkedIn`);
  }
});

// ==================== TWITCH ====================

router.get('/oauth/twitch/init', verifyJWT, (req, res) => {
  try {
    const state = signState({ id: req.user.id });
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/twitch/callback`;
    const authUrl = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:read:email&state=${state}`;
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Twitch OAuth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to start Twitch connection' });
  }
});

router.get('/oauth/twitch/callback', async (req, res) => {
  const frontendBase = `${process.env.FRONTEND_URL}/user-dashboard/accounts`;
  try {
    const { code, state, error: twchError } = req.query;
    if (twchError || !code || !state) return res.redirect(`${frontendBase}?error=Twitch`);

    const { id: userId } = verifyState(state);
    const redirectUri = `${process.env.BACKEND_URL}/api/platforms/oauth/twitch/callback`;

    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }
    });
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    });
    const twitchUser = profileRes.data.data?.[0];

    await saveLinkedAccount({
      userId, platform: 'Twitch',
      username: twitchUser?.display_name,
      platformUserId: twitchUser?.id,
      accessToken,
      refreshToken: tokenRes.data.refresh_token
    });

    res.redirect(`${frontendBase}?connected=Twitch`);
  } catch (error) {
    console.error('Twitch OAuth callback error:', error?.response?.data || error);
    res.redirect(`${frontendBase}?error=Twitch`);
  }
});

// ==================== TELEGRAM ====================
// Telegram doesn't use a redirect-based OAuth flow. Instead, the frontend
// embeds Telegram's own "Login Widget" (a script Telegram serves), which
// handles the login UI itself and hands back signed user data via a JS
// callback. We verify that signature here using the bot token as the
// HMAC-SHA256 key, per Telegram's documented verification algorithm.

router.post('/oauth/telegram/verify', verifyJWT, async (req, res) => {
  try {
    const { id, first_name, username, photo_url, auth_date, hash } = req.body;

    if (!id || !hash || !auth_date) {
      return res.status(400).json({ success: false, message: 'Invalid Telegram login data' });
    }

    // Reject stale login attempts (Telegram recommends checking this)
    const authAge = Math.floor(Date.now() / 1000) - Number(auth_date);
    if (authAge > 86400) {
      return res.status(400).json({ success: false, message: 'Telegram login expired, please try again' });
    }

    // Verify the signature: sort all fields except hash, join as
    // "key=value" lines, HMAC-SHA256 it with SHA256(bot_token) as the key.
    const dataCheck = { id, first_name, username, photo_url, auth_date };
    const checkString = Object.keys(dataCheck)
      .filter((key) => dataCheck[key] !== undefined)
      .sort()
      .map((key) => `${key}=${dataCheck[key]}`)
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    if (computedHash !== hash) {
      return res.status(401).json({ success: false, message: 'Telegram login verification failed' });
    }

    await saveLinkedAccount({
      userId: req.user.id, platform: 'Telegram',
      username: username || first_name,
      platformUserId: String(id),
      accessToken: null
    });

    res.json({ success: true, message: 'Telegram connected successfully' });
  } catch (error) {
    console.error('Telegram verify error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify Telegram login' });
  }
});

// ==================== Manual link / read / unlink (unchanged) ====================

router.post('/link', verifyJWT, async (req, res) => {
  try {
    const { platform, username, profileUrl, accessToken } = req.body;

    const existing = await LinkedAccount.findOne({
      where: { userId: req.user.id, platform }
    });

    if (existing) {
      await existing.update({ username, profileUrl, accessToken, isActive: true });
      return res.json({ success: true, data: existing });
    }

    const linked = await LinkedAccount.create({
      userId: req.user.id,
      platform,
      username,
      profileUrl,
      accessToken
    });

    res.status(201).json({ success: true, data: linked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/linked', verifyJWT, async (req, res) => {
  try {
    const accounts = await LinkedAccount.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/unlink/:platform', verifyJWT, async (req, res) => {
  try {
    await LinkedAccount.update(
      { isActive: false },
      { where: { userId: req.user.id, platform: req.params.platform } }
    );
    res.json({ success: true, message: 'Account unlinked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;