import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { createConversation, getConversations, getMessages } from "./chatControllers";



const chatRouter = express.Router();

chatRouter.post("/conversation", authMiddleware, createConversation);

chatRouter.get("/conversations", authMiddleware, getConversations);

chatRouter.get(
  "/conversation/:conversationId/messages",
  authMiddleware,
  getMessages,
);
chatRouter.post(
  "/conversation/:conversationId/message",
  authMiddleware,
  sendMessage
);

export default chatRouter;
