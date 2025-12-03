import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, onAuthStateChanged } from 'firebase/auth';

const PhoneAuth: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState('Ready for phone authentication');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStatus(`Authenticated as: ${currentUser.phoneNumber}`);
      }
    });
    return () => unsubscribe();
  }, []);

  const sendVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      setStatus('Please enter a valid phone number');
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      setStatus('Phone number must include country code (e.g., +1234567890)');
      return;
    }

    try {
      setLoading(true);
      setStatus('Setting up verification...');
      
      // Create fresh reCAPTCHA verifier each time
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal'
      });
      
      setStatus('Sending verification code...');
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      setConfirmationResult(result);
      setStatus('✅ Verification code sent! Check your SMS.');
    } catch (error: any) {
      console.error('SMS Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setStatus('Please enter the verification code');
      return;
    }

    if (!confirmationResult) {
      setStatus('Please request verification code first');
      return;
    }

    try {
      setLoading(true);
      setStatus('Verifying code...');
      
      const result = await confirmationResult.confirm(verificationCode);
      setStatus('✅ Phone authentication successful!');
      
      setVerificationCode('');
      setConfirmationResult(null);
    } catch (error: any) {
      console.error('Verification Error:', error);
      setStatus(`❌ Verification failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setConfirmationResult(null);
      setPhoneNumber('');
      setVerificationCode('');
      setStatus('Signed out successfully');
    } catch (error: any) {
      setStatus(`Sign out error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setConfirmationResult(null);
    setVerificationCode('');
    setStatus('Ready for phone authentication');
  };

  return (
    <div style={{ padding: '2rem', background: '#151515', color: '#fff', borderRadius: '8px', margin: '2rem' }}>
      <h3>🔐 Phone Authentication Test</h3>
      
      {!user ? (
        <div>
          {!confirmationResult ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="tel"
                  placeholder="Enter phone number (+1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  style={{
                    padding: '0.8rem',
                    marginRight: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    background: '#0a0a0a',
                    color: '#fff',
                    width: '280px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={sendVerificationCode}
                  disabled={loading || !phoneNumber.trim()}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: loading ? '#666' : '#FF7A00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div id="recaptcha-container"></div>
              </div>
              
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>
                📱 Format: +[country code][phone number]<br/>
                🇺🇸 US: +1234567890 | 🇮🇳 India: +911234567890
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  style={{
                    padding: '0.8rem',
                    marginRight: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    background: '#0a0a0a',
                    color: '#fff',
                    width: '200px',
                    fontSize: '16px',
                    textAlign: 'center',
                    letterSpacing: '2px'
                  }}
                  maxLength={6}
                />
                <button
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: loading ? '#666' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginRight: '0.5rem'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  style={{
                    padding: '0.8rem 1rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </div>
              
              <div style={{ fontSize: '12px', color: '#888' }}>
                📨 Check your SMS for the 6-digit code
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
          <p style={{ fontSize: '18px', marginBottom: '1rem' }}>Successfully Authenticated!</p>
          <p style={{ color: '#FF7A00', marginBottom: '2rem' }}>Phone: {user.phoneNumber}</p>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>User ID: {user.uid}</p>
          <button
            onClick={signOut}
            style={{
              padding: '0.8rem 2rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      )}
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#0a0a0a', 
        borderRadius: '4px',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ marginRight: '0.5rem' }}>📊</span>
          <strong>Status:</strong>
        </div>
        <div style={{ color: status.includes('✅') ? '#28a745' : status.includes('❌') ? '#dc3545' : '#ffc107' }}>
          {status}
        </div>
      </div>
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        background: '#1a1a2e', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#888'
      }}>
        <strong>⚠️ Firebase Console Setup Required:</strong><br/>
        1. Enable Phone Number sign-in method<br/>
        2. Add your domain to OAuth redirect domains<br/>
        3. Configure SMS region policy (optional)
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default PhoneAuth;