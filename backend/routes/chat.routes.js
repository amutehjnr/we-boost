const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { optionalAuth, verifyJWT, authorize } = require('../middleware/auth');

router.post('/start', optionalAuth, chatController.startConversation);
router.get('/conversations/:id/messages', optionalAuth, chatController.getMessages);
router.post('/conversations/:id/messages', optionalAuth, chatController.sendMessage);

router.get('/conversations', verifyJWT, authorize('admin'), chatController.getConversations);
router.put('/conversations/:id/close', verifyJWT, authorize('admin'), chatController.closeConversation);

module.exports = router;