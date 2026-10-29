import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Share, Text, View } from 'react-native';
import { api, errorMessage } from '@/lib/api';
import { formatDate, formatPkr, frequencyLabel } from '@/lib/format';
import type { CommitteeDetail } from '@/lib/types';
import { Button, Card, ErrorText, Muted, StatusBadge } from '@/ui/kit';
import { useTheme } from '@/ui/theme';

export default function CommitteeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const [data, setData] = useState<CommitteeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<CommitteeDetail>(`/committees/${id}`));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!data) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: error ? 'flex-start' : 'center' }}>
        {error ? <ErrorText>{error}</ErrorText> : <ActivityIndicator />}
      </View>
    );
  }

  const openSeats = data.totalMembers - data.members.length;

  return (
    <>
      <Stack.Screen options={{ title: data.name }} />
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ gap: 8 }}>
          <StatusBadge status={data.status} />
          {data.description ? <Muted>{data.description}</Muted> : null}
        </View>

        <Card>
          <Row label="Contribution" value={`${formatPkr(data.contributionPkr)} ${frequencyLabel(data.frequency)}`} />
          <Row label="Pot per cycle" value={formatPkr(data.contributionPkr * data.totalMembers)} />
          <Row label="First payment due" value={formatDate(data.startDate)} />
          <Row label="Members" value={`${data.members.length} of ${data.totalMembers}`} />
        </Card>

        {data.status === 'DRAFT' && (
          <Card>
            <Text style={{ color: t.muted, fontSize: 13 }}>Invite code</Text>
            <Text selectable style={{ color: t.text, fontSize: 28, fontWeight: '800', letterSpacing: 4 }}>
              {data.inviteCode}
            </Text>
            <Muted>
              {openSeats > 0
                ? `${openSeats} seat${openSeats === 1 ? '' : 's'} left. Share the code so members can join.`
                : 'The committee is full.'}
            </Muted>
            <Button
              title="Share invite code"
              variant="outline"
              onPress={() =>
                void Share.share({
                  message: `Join "${data.name}" on Committee. Invite code: ${data.inviteCode}`,
                })
              }
            />
          </Card>
        )}

        <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>Members</Text>
        <Card>
          {data.members.map((m, i) => (
            <View
              key={m.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderTopWidth: i === 0 ? 0 : 1,
                borderColor: t.line,
              }}
            >
              <Text style={{ color: t.text, flexShrink: 1 }}>
                {m.payoutOrder ? `${m.payoutOrder}. ` : ''}
                {m.user.name}
              </Text>
              <Text style={{ color: t.muted }}>{m.role === 'ORGANIZER' ? 'Organizer' : 'Member'}</Text>
            </View>
          ))}
        </Card>

        <ErrorText>{error}</ErrorText>
      </ScrollView>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: t.muted }}>{label}</Text>
      <Text style={{ color: t.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}
