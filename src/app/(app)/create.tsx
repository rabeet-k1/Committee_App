import { router } from 'expo-router';
import { useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import { formatPkr, toIsoDate } from '@/lib/format';
import type { Committee } from '@/lib/types';
import { Button, ErrorText, Field, Screen, Segmented } from '@/ui/kit';

const DAY_MS = 86_400_000;

export default function CreateCommitteeScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState('');
  const [frequency, setFrequency] = useState(30);
  const [startDate, setStartDate] = useState(toIsoDate(new Date(Date.now() + 7 * DAY_MS)));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const amountNum = Number(amount);
  const membersNum = Number(members);
  const potPreview =
    Number.isInteger(amountNum) && Number.isInteger(membersNum) && amountNum > 0 && membersNum > 0
      ? `Each cycle pays out ${formatPkr(amountNum * membersNum)} to one member.`
      : undefined;

  async function submit() {
    if (name.trim().length < 3) return setError('Give the committee a name (at least 3 characters).');
    if (!Number.isInteger(amountNum) || amountNum < 100) return setError('Contribution must be a whole amount of at least Rs 100.');
    if (!Number.isInteger(membersNum) || membersNum < 2 || membersNum > 50) return setError('Members must be between 2 and 50.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(Date.parse(startDate))) {
      return setError('Start date must look like 2026-11-30.');
    }

    setError(null);
    setBusy(true);
    try {
      const created = await api<Committee>('/committees', {
        method: 'POST',
        body: {
          name: name.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          contributionPkr: amountNum,
          totalMembers: membersNum,
          frequency,
          startDate,
        },
      });
      router.replace({ pathname: '/committee/[id]', params: { id: created.id } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Field label="Committee name" value={name} onChangeText={setName} placeholder="Office Kameti" />
      <Field
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={300}
      />
      <Field
        label="Contribution per member (PKR)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        placeholder="5000"
        hint={potPreview}
      />
      <Field
        label="Number of members"
        value={members}
        onChangeText={setMembers}
        keyboardType="number-pad"
        placeholder="10"
        hint="This is also the number of cycles, one payout per member."
      />
      <Segmented
        label="How often do members pay?"
        value={frequency}
        onChange={setFrequency}
        options={[
          { label: 'Weekly', value: 7 },
          { label: 'Every 2 weeks', value: 14 },
          { label: 'Monthly', value: 30 },
        ]}
      />
      <Field
        label="First payment due (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2026-11-30"
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />

      <ErrorText>{error}</ErrorText>
      <Button title="Create committee" onPress={submit} loading={busy} />
    </Screen>
  );
}
