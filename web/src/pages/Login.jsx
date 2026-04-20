import React, { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { sendOtp, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendOtp(mobile);
      setStep('otp');
    } catch (err) {
      setError(err.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(mobile, otp);
      navigate('/');
    } catch (err) {
      setError(err.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4"
         style={{
           backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 39px, rgba(237,233,224,0.06) 39px, rgba(237,233,224,0.06) 40px)`
         }}>
      <div className="card p-8 w-full max-w-md animate-stagger-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-heading font-bold">D</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-text">FFMA Admin</h1>
          <p className="text-text-muted mt-1 text-sm">Dhanashree Crop Solutions</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-danger rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={handleSendOtp}>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Registered Mobile Number
            </label>
            <input
              id="mobile-input"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-lg"
              required
            />
            <button
              id="send-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-heading font-semibold transition-all btn-press disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-sm text-text-muted mb-4">OTP sent to <span className="font-mono font-semibold text-text">{mobile}</span></p>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Enter 6-digit OTP
            </label>
            <input
              id="otp-input"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text text-center tracking-[0.5em] font-mono text-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <button
              id="verify-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-heading font-semibold transition-all btn-press disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('mobile'); setOtp(''); setError(''); }}
              className="w-full mt-3 text-text-muted hover:text-text text-sm py-2 transition-colors"
            >
              ← Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
