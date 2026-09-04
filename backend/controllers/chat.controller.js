// controllers/chat.controller.js
const crypto = require('crypto');
const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Start (or resume) a conversation. Works for logged-in users
//          and anonymous guests — optionalAuth sets req.user if a valid
//          token is present, otherwise this falls back to guest mode.
// @route   POST /api/chat/start
// @access  Public (optional auth)
exports.startConversation = async (req, res) => {
  try {
    const { guestName, guestEmail, guestToken: existingGuestToken } = req.body;

    if (req.user) {
      // Logged-in visitor — reuse their open conversation if they have one
      let conversation = await Conversation.findOne({
        where: { userId: req.user.id, status: 'Open' }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          userId: req.user.id,
          lastMessageAt: new Date()
        });
      }

      return res.status(200).json({ success: true, data: conversation });
    }

    // Guest flow — resume via a previously-issued guestToken if the
    // browser already has one and it's still open
    if (existingGuestToken) {
      const existing = await Conversation.findOne({
        where: { guestToken: existingGuestToken, status: 'Open' }
      });
      if (existing) {
        return res.status(200).json({ success: true, data: existing });
      }
    }

    if (!guestName || !guestEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name and email to start a chat'
      });
    }

    const guestToken = crypto.randomBytes(24).toString('hex');
    const conversation = await Conversation.create({
      guestName,
      guestEmail,
      guestToken,
      lastMessageAt: new Date()
    });

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to start conversation' });
  }
};

// Confirms the requester actually owns this conversation — either the
// logged-in user who created it, the matching guestToken, or an admin.
const authorizeConversationAccess = (conversation, req) => {
  if (req.user?.role === 'admin') return true;
  if (req.user && conversation.userId === req.user.id) return true;
  if (!req.user && req.body.guestToken && conversation.guestToken === req.body.guestToken) return true;
  if (!req.user && req.query.guestToken && conversation.guestToken === req.query.guestToken) return true;
  return false;
};

// @desc    Poll for messages in a conversation, optionally only those
//          newer than `since` (ISO timestamp) for efficient polling.
// @route   GET /api/chat/conversations/:id/messages
// @access  Public (optional auth) — ownership checked manually
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!authorizeConversationAccess(conversation, req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this conversation' });
    }

    const where = { conversationId: conversation.id };
    if (req.query.since) {
      where.createdAt = { [Op.gt]: new Date(req.query.since) };
    }

    const messages = await Message.findAll({
      where,
      order: [['createdAt', 'ASC']]
    });

    // Mark the other party's messages as read by whoever is polling
    const readField = req.user?.role === 'admin' ? 'readByAdmin' : 'readByVisitor';
    const otherSenderType = req.user?.role === 'admin' ? { [Op.ne]: 'admin' } : 'admin';
    await Message.update(
      { [readField]: true },
      { where: { conversationId: conversation.id, senderType: otherSenderType, [readField]: false } }
    );

    res.status(200).json({ success: true, data: messages, conversation });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/chat/conversations/:id/messages
// @access  Public (optional auth) — ownership checked manually
exports.sendMessage = async (req, res) => {
  try {
    const { text, guestToken } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!authorizeConversationAccess(conversation, { ...req, body: { guestToken } })) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply here' });
    }

    let senderType;
    if (req.user?.role === 'admin') senderType = 'admin';
    else if (req.user) senderType = 'user';
    else senderType = 'guest';

    const message = await Message.create({
      conversationId: conversation.id,
      senderType,
      senderId: req.user?.id || null,
      text: text.trim(),
      readByAdmin: senderType === 'admin',
      readByVisitor: senderType !== 'admin'
    });

    await conversation.update({
      lastMessageAt: new Date(),
      status: 'Open',
      ...(senderType === 'admin' && !conversation.assignedAdminId ? { assignedAdminId: req.user.id } : {})
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// @desc    List conversations for the admin inbox
// @route   GET /api/chat/conversations
// @access  Private (admin only)
exports.getConversations = async (req, res) => {
  try {
    const { status = 'Open' } = req.query;

    const conversations = await Conversation.findAll({
      where: { status },
      order: [['lastMessageAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }
      ]
    });

    // Unread-by-admin count per conversation, for an inbox badge
    const withUnread = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await Message.count({
          where: { conversationId: c.id, senderType: { [Op.ne]: 'admin' }, readByAdmin: false }
        });
        return { ...c.toJSON(), unreadCount };
      })
    );

    res.status(200).json({ success: true, data: withUnread });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to load conversations' });
  }
};

// @desc    Close a conversation
// @route   PUT /api/chat/conversations/:id/close
// @access  Private (admin only)
exports.closeConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    await conversation.update({ status: 'Closed' });
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to close conversation' });
  }
};