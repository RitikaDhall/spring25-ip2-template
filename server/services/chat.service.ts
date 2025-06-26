import ChatModel from '../models/chat.model';
import MessageModel from '../models/messages.model';
import UserModel from '../models/users.model';
import { Chat, ChatResponse, CreateChatPayload } from '../types/chat';
import { Message, MessageResponse } from '../types/message';

/**
 * Creates and saves a new chat document in the database, saving messages dynamically.
 *
 * @param chat - The chat object to be saved, including full message objects.
 * @returns {Promise<ChatResponse>} - Resolves with the saved chat or an error message.
 */
export const saveChat = async (chatPayload: CreateChatPayload): Promise<ChatResponse> => {
  // TODO: Task 3 - Implement the saveChat function. Refer to other service files for guidance.
  try {
    const messageIds = await Promise.all(
      chatPayload.messages.map(async msg => {
        const savedMessage = await MessageModel.create(msg);
        if ('error' in savedMessage) {
          throw new Error('Error saving message');
        }
        return savedMessage._id;
      }),
    );

    const response = await ChatModel.create({
      participants: chatPayload.participants,
      messages: messageIds,
    });

    return response;
  } catch (error) {
    return { error: `Error occurred while saving chat: ${error as Error}.message` };
  }
};

/**
 * Creates and saves a new message document in the database.
 * @param messageData - The message data to be created.
 * @returns {Promise<MessageResponse>} - Resolves with the created message or an error message.
 */
export const createMessage = async (messageData: Message): Promise<MessageResponse> => {
  // TODO: Task 3 - Implement the createMessage function. Refer to other service files for guidance.
  try {
    const user = await UserModel.findOne({ username: messageData.msgFrom });
    if (!user) {
      throw new Error('User not found');
    }
    const response = await MessageModel.create(messageData);
    return response;
  } catch (error) {
    return { error: `Error occurred while creating message: ${error as Error}.message` };
  }
};

/**
 * Adds a message ID to an existing chat.
 * @param chatId - The ID of the chat to update.
 * @param messageId - The ID of the message to add to the chat.
 * @returns {Promise<ChatResponse>} - Resolves with the updated chat object or an error message.
 */
export const addMessageToChat = async (
  chatId: string,
  messageId: string,
): Promise<ChatResponse> => {
  // TODO: Task 3 - Implement the addMessageToChat function. Refer to other service files for guidance.
  try {
    const chat = await ChatModel.findByIdAndUpdate(
      chatId,
      { $push: { messages: messageId } },
      { new: true },
    );

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  } catch (error) {
    return { error: `Error occurred while adding the message to chat: ${error as Error}.message` };
  }
};

/**
 * Retrieves a chat document by its ID.
 * @param chatId - The ID of the chat to retrieve.
 * @returns {Promise<ChatResponse>} - Resolves with the found chat object or an error message.
 */
export const getChat = async (chatId: string): Promise<ChatResponse> => {
  // TODO: Task 3 - Implement the getChat function. Refer to other service files for guidance.
  try {
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  } catch (error) {
    return { error: `Error occurred while retrieving chat: ${error as Error}.message` };
  }
};

/**
 * Retrieves chats that include all the provided participants.
 * @param p An array of participant usernames to match in the chat's participants.
 * @returns {Promise<Chat[]>} A promise that resolves to an array of chats where the participants match.
 * If no chats are found or an error occurs, the promise resolves to an empty array.
 */
export const getChatsByParticipants = async (p: string[]): Promise<Chat[]> => {
  // TODO: Task 3 - Implement the getChatsByParticipants function. Refer to other service files for guidance.
  try {
    const chats = await ChatModel.find({ participants: { $all: p } }).lean();
    if (!chats) {
      throw new Error('No chats found for this participant');
    }
    return chats;
  } catch (error) {
    return [];
  }
};

/**
 * Adds a participant to an existing chat.
 *
 * @param chatId - The ID of the chat to update.
 * @param userId - The ID of the user to add to the chat.
 * @returns {Promise<ChatResponse>} - Resolves with the updated chat object or an error message.
 */
export const addParticipantToChat = async (
  chatId: string,
  userId: string,
): Promise<ChatResponse> => {
  // TODO: Task 3 - Implement the addParticipantToChat function. Refer to other service files for guidance.
  try {
    const user = await UserModel.findOne({ username: userId });

    if (!user) {
      throw new Error('User not found');
    }

    const chat = await ChatModel.findByIdAndUpdate(
      { _id: chatId, participants: { $in: [user._id] } },
      { $push: { participants: user._id } },
      { new: true },
    );

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  } catch (error) {
    return { error: `Error occurred while adding participant to chat: ${error as Error}.message` };
  }
};
