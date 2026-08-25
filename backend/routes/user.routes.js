// ========== routes/user.routes.js ==========
const express = require('express');
const router = express.Router();
const { User, LinkedAccount } = require('../models');
const { verifyJWT, authorize } = require('../middleware/auth');

// Get user profile
router.get('/profile', verifyJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: LinkedAccount, as: 'linkedAccounts' }]
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
router.put('/profile', verifyJWT, async (req, res) => {
  try {
    const { fullName, bio, phoneNumber, theme, notificationsEnabled } = req.body;
    const user = await User.findByPk(req.user.id);
    
    await user.update({
      fullName: fullName || user.fullName,
      bio: bio !== undefined ? bio : user.bio,
      phoneNumber: phoneNumber || user.phoneNumber,
      theme: theme || user.theme,
      notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : user.notificationsEnabled
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle user mode (client/user)
router.post('/toggle-mode', verifyJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const nowIsClient = !user.isClient;
    await user.update({
      isClient: nowIsClient,
      // Preserve admin role — the client/user mode toggle is a separate
      // concern from admin privileges.
      role: user.role === 'admin' ? 'admin' : (nowIsClient ? 'client' : 'user')
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Toggle mode error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user statistics
router.get('/stats', verifyJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({
      success: true,
      data: {
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        totalWithdrawn: user.totalWithdrawn,
        totalSpent: user.totalSpent,
        tasksCompleted: user.tasksCompleted,
        ordersCreated: user.ordersCreated,
        userLevel: user.userLevel
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;