import prisma from "../../config/prisma.js"; // Added .js extension for consistency
import { getIO } from "../../socket/socket.js"; // Added .js extension

export const createConversation = async (req, res) => {
  try {
    const { farmerId } = req.body;
    
    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: "Farmer ID is required",
      });
    }

    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found",
      });
    }

    const farmer = await prisma.farmer.findUnique({
      where: {
        id: parseInt(farmerId)
      }
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        buyerId: buyer.id,
        farmerId: farmer.id
      }
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: existingConversation,
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        buyerId: buyer.id,
        farmerId: farmer.id
      }
    });

    return res.status(201).json({
      success: true,
      conversation,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getConversations = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id
      }
    });

    const farmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    let conversations = [];

    if (buyer) {
      conversations = await prisma.conversation.findMany({
        where: {
          buyerId: buyer.id
        },
        include: {
          farmer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1, // Get only the latest message
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      });
    }

    if (farmer) {
      conversations = await prisma.conversation.findMany({
        where: {
          farmerId: farmer.id,
        },
        include: {
          buyer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1, // Get only the latest message
          }
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(conversationId),
        OR: [
          { buyer: { userId: req.user.id } },
          { farmer: { userId: req.user.id } }
        ]
      }
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId)
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: parseInt(conversationId),
        senderId: {
          not: req.user.id
        },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(conversationId),
        OR: [
          { buyer: { userId: req.user.id } },
          { farmer: { userId: req.user.id } }
        ]
      },
      include: {
        buyer: {
          include: {
            user: true
          }
        },
        farmer: {
          include: {
            user: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: parseInt(conversationId),
        senderId: req.user.id,
        text: text.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: {
        id: parseInt(conversationId)
      },
      data: {
        updatedAt: new Date()
      }
    });

    // Get the recipient's user ID for the socket
    const recipientUserId = conversation.buyer.userId === req.user.id 
      ? conversation.farmer.userId 
      : conversation.buyer.userId;

    const io = getIO();
    
    // Emit to the conversation room
    io.to(`conversation-${conversationId}`).emit("receiveMessage", {
      ...message,
      conversationId: parseInt(conversationId)
    });

    // Optional: Emit to the recipient's personal room for notifications
    io.to(`user-${recipientUserId}`).emit("newMessage", {
      conversationId: parseInt(conversationId),
      message: message
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// New function: Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await prisma.message.updateMany({
      where: {
        conversationId: parseInt(conversationId),
        senderId: {
          not: req.user.id
        },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}