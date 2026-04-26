const { Message, User } = require("../models");
const { Op } = require("sequelize");

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ message: "receiverId and content are required." });
    }
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: parseInt(receiverId),
      content,
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all conversations for logged-in user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages involving this user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        { model: User, as: "sender",   attributes: ["id", "name", "email"] },
        { model: User, as: "receiver", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Group by conversation partner
    const convMap = {};
    messages.forEach((msg) => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!partner) return;
      const pid = partner.id;
      if (!convMap[pid]) {
        convMap[pid] = { partner, messages: [], unreadCount: 0 };
      }
      convMap[pid].messages.push({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
      });
      if (msg.receiverId === userId && !msg.isRead) {
        convMap[pid].unreadCount++;
      }
    });

    // Mark as read
    await Message.update(
      { isRead: true },
      { where: { receiverId: userId, isRead: false } }
    );

    res.json(Object.values(convMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages between two users
exports.getMessagesWith = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = parseInt(req.params.userId);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: [
        { model: User, as: "sender",   attributes: ["id", "name"] },
        { model: User, as: "receiver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Mark received messages as read
    await Message.update(
      { isRead: true },
      { where: { senderId: otherId, receiverId: userId, isRead: false } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
