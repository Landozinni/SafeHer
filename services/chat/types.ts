import { Timestamp } from "firebase/firestore";

export interface Conversation {
  id: string;

  participants: string[];

  lastMessage: string;

  lastMessageSender: string;

  createdAt?: Timestamp;

  lastMessageAt?: Timestamp;
}

export interface Message {
  id: string;

  senderId: string;

  text: string;

  createdAt?: Timestamp;

  readBy?: string[];
}

export interface ChatUser {
  uid: string;

  name: string;

  email: string;
}
