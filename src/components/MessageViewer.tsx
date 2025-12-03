import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: any;
  read: boolean;
}

const MessageViewer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const messageList: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      
      setMessages(messageList);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { read: true });
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div style={{ padding: '2rem', background: '#fff', color: '#000' }}>
      <h2>Contact Messages</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((message) => (
          <div key={message.id} style={{ 
            border: '1px solid #ddd', 
            padding: '1rem', 
            margin: '1rem 0',
            backgroundColor: message.read ? '#f9f9f9' : '#fff3cd'
          }}>
            <h4>{message.name} - {message.subject}</h4>
            <p><strong>Email:</strong> {message.email}</p>
            <p><strong>Message:</strong> {message.message}</p>
            <p><strong>Date:</strong> {message.timestamp?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
            {!message.read && (
              <button onClick={() => markAsRead(message.id)}>Mark as Read</button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MessageViewer;