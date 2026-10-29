import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './theme';

/** Scrollable form screen. Use safe for screens without a navigation header (login/register). */
export function Screen({ children, safe = false }: { children: ReactNode; safe?: boolean }) {
  const t = useTheme();
  const body = (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {safe ? <SafeAreaView style={{ flex: 1 }}>{body}</SafeAreaView> : body}
    </KeyboardAvoidingView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[styles.title, { color: t.text }]}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ color: t.muted, fontSize: 14 }}>{children}</Text>;
}

export function ErrorText({ children }: { children?: string | null }) {
  const t = useTheme();
  if (!children) return null;
  return <Text style={{ color: t.danger, fontSize: 14 }}>{children}</Text>;
}

export function Card({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={[styles.card, { backgroundColor: t.card, borderColor: t.line }]}>{children}</View>;
}

type FieldProps = TextInputProps & { label: string; hint?: string };

export function Field({ label, hint, style, ...props }: FieldProps) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: t.muted, fontSize: 13 }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.muted}
        {...props}
        style={[
          styles.input,
          { backgroundColor: t.card, borderColor: t.line, color: t.text },
          props.multiline && { minHeight: 80, textAlignVertical: 'top' },
          style,
        ]}
      />
      {hint ? <Text style={{ color: t.muted, fontSize: 12 }}>{hint}</Text> : null}
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}

export function Button({ title, onPress, loading, disabled, variant = 'primary' }: ButtonProps) {
  const t = useTheme();
  const primary = variant === 'primary';
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? t.brand : 'transparent',
          borderColor: primary ? t.brand : t.line,
          opacity: inactive ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? t.brandInk : t.text} />
      ) : (
        <Text style={[styles.buttonText, { color: primary ? t.brandInk : t.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

interface SegmentedProps<T extends number | string> {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends number | string>({ label, options, value, onChange }: SegmentedProps<T>) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: t.muted, fontSize: 13 }}>{label}</Text>
      <View style={styles.segments}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              style={[
                styles.segment,
                { borderColor: active ? t.brand : t.line, backgroundColor: active ? t.brand : t.card },
              ]}
            >
              <Text style={{ color: active ? t.brandInk : t.text, fontWeight: '600', fontSize: 13 }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const STATUS_COLOR: Record<string, 'ok' | 'warn' | 'muted' | 'danger'> = {
  ACTIVE: 'ok',
  COMPLETED: 'ok',
  DRAFT: 'muted',
  CANCELLED: 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  const t = useTheme();
  const color = t[STATUS_COLOR[status] ?? 'muted'];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16 },
  button: { borderWidth: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  segments: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  segment: { borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
});
