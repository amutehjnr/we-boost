const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyFirebaseToken, verifyJWT } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/me', verifyJWT, authController.getMe);
router.post('/logout', verifyJWT, authController.logout);
router.put('/password', verifyJWT, authController.updatePassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', verifyJWT, authController.resendVerification);

module.exports = router;