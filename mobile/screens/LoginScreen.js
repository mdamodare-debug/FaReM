import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import api from '../services/api';
import { theme } from '../theme';

export default function LoginScreen({ onLogin }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.sendOtp(mobile);
      setStep('otp');
    } catch (e) {
      setError(e.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(mobile, otp);
      onLogin();
    } catch (e) {
      setError(e.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
            <Text style={styles.logoText}>D</Text>
        </View>
        <Text style={styles.title}>FFMA Mobile</Text>
        <Text style={styles.subtitle}>Dhanashree Crop Solutions</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {step === 'mobile' ? (
          <View>
            <Text style={styles.label}>Registered Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
            />
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>OTP sent to {mobile}</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('mobile')}>
              <Text style={styles.backLink}>Change Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  logoContainer: { width: 60, height: 60, backgroundColor: theme.colors.primary, borderRadius: 15, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 15 },
  logoText: { color: '#fff', fontSize: 32, fontFamily: theme.fonts.heading, fontWeight: 'bold' },
  title: { fontSize: 24, fontFamily: theme.fonts.heading, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.textMuted, marginBottom: 8 },
  input: { borderHeight: 1, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 10, padding: 15, fontSize: 18, fontFamily: theme.fonts.mono, backgroundColor: '#fff', marginBottom: 20 },
  otpInput: { textAlign: 'center', letterSpacing: 5 },
  button: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: theme.fonts.heading, fontWeight: 'bold' },
  errorText: { color: theme.colors.danger, fontSize: 14, textAlign: 'center', marginBottom: 15 },
  backLink: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 15 }
});
