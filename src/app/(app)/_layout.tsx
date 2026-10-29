import { Stack } from 'expo-router';
import { useTheme } from '@/ui/theme';

export default function AppLayout() {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.card },
        headerTintColor: t.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: t.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Committees' }} />
      <Stack.Screen name="create" options={{ title: 'New Committee' }} />
      <Stack.Screen name="join" options={{ title: 'Join Committee' }} />
      <Stack.Screen name="committee/[id]" options={{ title: 'Committee' }} />
    </Stack>
  );
}
