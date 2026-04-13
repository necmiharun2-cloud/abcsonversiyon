import { collection, addDoc, query, where, onSnapshot, orderBy, doc, setDoc, serverTimestamp, getDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any;
  participantNames?: { [key: string]: string };
  participantAvatars?: { [key: string]: string };
  productId?: string;
  productTitle?: string;
}

export const chatService = {
  async createOrGetChat(
    participants: string[], 
    participantData: { [key: string]: { name: string, avatar: string } },
    productInfo?: { productId: string, productTitle: string }
  ) {
    const sortedParticipants = [...participants].sort();
    const chatId = sortedParticipants.join('_');
    const chatRef = doc(db, 'chats', chatId);
    
    const participantNames: { [key: string]: string } = {};
    const participantAvatars: { [key: string]: string } = {};
    
    sortedParticipants.forEach(uid => {
      participantNames[uid] = participantData[uid]?.name || 'Kullanıcı';
      participantAvatars[uid] = participantData[uid]?.avatar || '';
    });

    const existing = await getDoc(chatRef);
    if (!existing.exists()) {
      // Create only once. Rules allow create with full schema,
      // but updates are intentionally restricted to lastMessage fields.
      const chatData: any = {
        id: chatId,
        participants: sortedParticipants,
        participantNames,
        participantAvatars,
        createdAt: serverTimestamp()
      };
      
      // Add product info if provided
      if (productInfo) {
        chatData.productId = productInfo.productId;
        chatData.productTitle = productInfo.productTitle;
      }
      
      await setDoc(chatRef, chatData);
    }

    return chatId;
  },

  async createChat(
    participants: string[], 
    participantData: { [key: string]: { name: string, avatar: string } },
    productInfo?: { productId: string, productTitle: string }
  ) {
    return this.createOrGetChat(participants, participantData, productInfo);
  },

  getChats(userId: string, callback: (chats: Chat[]) => void) {
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      callback(chats);
    });
  },

  getMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      callback(messages);
    });
  },

  async sendMessage(chatId: string, senderId: string, text: string) {
    const messageData = {
      chatId,
      senderId,
      text,
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
    
    // Update last message in chat doc
    await setDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp()
    }, { merge: true });
  },

  async deleteChat(chatId: string) {
    try {
      // First delete all messages in the chat
      const messagesQuery = query(collection(db, `chats/${chatId}/messages`));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach((messageDoc) => {
        batch.delete(messageDoc.ref);
      });
      
      // Delete the chat document
      batch.delete(doc(db, 'chats', chatId));
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }
};

