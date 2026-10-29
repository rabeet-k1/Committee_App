import { useColorScheme } from 'react-native';

const light = {
  bg: '#f6f7f9',
  card: '#ffffff',
  text: '#16181d',
  muted: '#6b7280',
  line: '#e5e7eb',
  brand: '#0f766e',
  brandInk: '#ffffff',
  danger: '#b91c1c',
  ok: '#15803d',
  warn: '#b45309',
};

const dark: typeof light = {
  bg: '#0f1115',
  card: '#171a21',
  text: '#e8eaee',
  muted: '#9aa3b2',
  line: '#272c36',
  brand: '#2dd4bf',
  brandInk: '#04211e',
  danger: '#f87171',
  ok: '#4ade80',
  warn: '#fbbf24',
};

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light;
}
