import { router } from 'expo-router';
import { useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import { Button, ErrorText, Field, Muted, Screen } from '@/ui/kit';

export default function JoinCommitteeScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const inviteCode = code.trim().toUpperCase();
    if (inviteCode.length !== 8) return setError('Invite codes are 8 characters long.');

    setError(null);
    setBusy(true);
    try {
      const joined = await api<{ committeeId: string; memberId: string }>('/committees/join', {
        method: 'POST',
        body: { inviteCode },
      });
      router.replace({ pathname: '/committee/[id]', params: { id: joined.committeeId } });
    } catch (e) {
      setError(errorMessage(e)); // e.g. invalid code, committee full, already a member
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Muted>Ask the organizer for the 8-character invite code.</Muted>
      <Field
        label="Invite code"
        value={code}
        onChangeText={(v) => setCode(v.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={8}
        placeholder="ABCD2345"
        onSubmitEditing={submit}
        style={{ letterSpacing: 4, fontSize: 20, textAlign: 'center' }}
      />
      <ErrorText>{error}</ErrorText>
      <Button title="Join committee" onPress={submit} loading={busy} />
    </Screen>
  );
}
