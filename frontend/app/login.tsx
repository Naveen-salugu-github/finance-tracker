import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Email and password are required' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = isSignUp ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    if (isSignUp) {
      setMessage({ type: 'success', text: 'Account created. Check your email to confirm, or sign in.' });
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logo}>
          <Ionicons name="wallet" size={56} color="#3b82f6" />
        </View>
        <Text style={styles.title}>Finance Tracker</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create an account' : 'Sign in to continue'}
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {message ? (
          <Text style={[styles.message, message.type === 'error' ? styles.messageError : styles.messageSuccess]}>
            {message.text}
          </Text>
        ) : null}

        <Button
          title={loading ? '' : isSignUp ? 'Sign up' : 'Sign in'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />

        <TouchableOpacity
          style={styles.switch}
          onPress={() => {
            setIsSignUp(!isSignUp);
            setMessage(null);
          }}
          disabled={loading}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  logo: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  messageError: {
    color: '#ef4444',
  },
  messageSuccess: {
    color: '#10b981',
  },
  switch: {
    marginTop: 24,
    alignSelf: 'center',
  },
  switchText: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
