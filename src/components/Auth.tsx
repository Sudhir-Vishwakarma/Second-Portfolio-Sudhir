import React, { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Auth.css';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const setupRecaptcha = () => {
    const container = document.getElementById('recaptcha-container');
    if (!container) return;
    
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
    });
  };

  const sendOTP = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      alert('Error sending OTP. Please try again.');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp || !confirmationResult) return;
    
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        phoneNumber: user.phoneNumber,
        uid: user.uid,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      onAuthSuccess();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome</h2>
        
        {step === 'phone' ? (
          <div className="auth-form">
            <input
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="auth-input"
            />
            <button 
              onClick={sendOTP} 
              disabled={loading || !phoneNumber}
              className="auth-btn"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="auth-form">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="auth-input"
            />
            <button 
              onClick={verifyOTP} 
              disabled={loading || !otp}
              className="auth-btn"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              onClick={() => setStep('phone')}
              className="auth-btn-secondary"
            >
              Back
            </button>
          </div>
        )}
        
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
};

export default Auth;