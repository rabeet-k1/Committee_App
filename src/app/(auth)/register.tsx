import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button, ErrorText, Field, Muted, Screen, Title } from '@/ui/kit';
import { useTheme } from '@/ui/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const t = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (name.trim().length < 2) return setError('Enter your name.');
    if (!phone.trim()) return setError('Enter your phone number.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setError(null);
    setBusy(true);
    try {
      await register({ name, phone, email, password });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen safe>
      <Title>Create account</Title>
      <Muted>Your phone number is how members and organizers know you.</Muted>

      <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
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
        label="Email (optional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        autoCapitalize="none"
        hint="At least 8 characters"
      />

      <ErrorText>{error}</ErrorText>
      <Button title="Create account" onPress={submit} loading={busy} />

      <Link href="/login" style={{ textAlign: 'center', paddingVertical: 8 }}>
        <Text style={{ color: t.muted }}>
          Already registered? <Text style={{ color: t.brand, fontWeight: '600' }}>Sign in</Text>
        </Text>
      </Link>
    </Screen>
  );
}
