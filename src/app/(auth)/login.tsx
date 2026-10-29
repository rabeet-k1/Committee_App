import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button, ErrorText, Field, Muted, Screen, Title } from '@/ui/kit';
import { useTheme } from '@/ui/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const t = useTheme();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!phone.trim() || !password) {
      setError('Enter your phone number and password.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await login(phone, password); // on success the root layout swaps to the app screens
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen safe>
      <Title>Welcome back</Title>
      <Muted>Sign in to manage your committees.</Muted>

      <Field
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="03001234567"
        keyboardType="phone-pad"
        autoComplete="tel"
        autoCapitalize="none"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        autoCapitalize="none"
        onSubmitEditing={submit}
      />

      <ErrorText>{error}</ErrorText>
      <Button title="Sign in" onPress={submit} loading={busy} />

      <Link href="/register" style={{ textAlign: 'center', paddingVertical: 8 }}>
        <Text style={{ color: t.muted }}>
          No account? <Text style={{ color: t.brand, fontWeight: '600' }}>Create one</Text>
        </Text>
      </Link>
    </Screen>
  );
}
