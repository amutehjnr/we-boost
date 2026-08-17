const express = require('express');
const router = express.Router();
const { LinkedAccount } = require('../models');
const { verifyJWT } = require('../middleware/auth');

// Link social account
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

// Get linked accounts
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

// Unlink account
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