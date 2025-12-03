import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [data, setData] = useState<any[]>([]);

  // Test Firestore connection
  const testFirestore = async () => {
    try {
      setStatus('Testing Firestore...');
      
      // Add a test document
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Firebase connection test',
        timestamp: new Date()
      });
      
      // Read documents
      const querySnapshot = await getDocs(collection(db, 'test'));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setData(docs);
      setStatus('✅ Firestore connected successfully!');
    } catch (error) {
      setStatus(`❌ Firestore error: ${error}`);
    }
  };

  // Test Storage connection
  const testStorage = async () => {
    try {
      setStatus('Testing Storage...');
      
      // Create a test file
      const testFile = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
      const storageRef = ref(storage, 'test/test-file.txt');
      
      // Upload file
      await uploadBytes(storageRef, testFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      setStatus(`✅ Storage connected! File URL: ${downloadURL}`);
    } catch (error) {
      setStatus(`❌ Storage error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#151515', color: '#fff', borderRadius: '8px', margin: '2rem' }}>
      <h3>Firebase Connection Test</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testFirestore}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem', 
            background: '#FF7A00', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Firestore
        </button>
        
        <button 
          onClick={testStorage}
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#FF7A00', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Storage
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#0a0a0a', borderRadius: '4px' }}>
        <strong>Status:</strong> {status}
      </div>
      
      {data.length > 0 && (
        <div>
          <h4>Firestore Data:</h4>
          <pre style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;