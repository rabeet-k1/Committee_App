import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS = 'cm_access';
const REFRESH = 'cm_refresh';

type WebStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};
const web = () => (globalThis as unknown as { localStorage?: WebStorage }).localStorage;

async function get(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return web()?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}
async function set(key: string, value: string) {
  if (Platform.OS === 'web') return web()?.setItem(key, value);
  await SecureStore.setItemAsync(key, value);
}
async function del(key: string) {
  if (Platform.OS === 'web') return web()?.removeItem(key);
  await SecureStore.deleteItemAsync(key);
}

// Tokens live in the OS keychain/keystore (SecureStore), not plain AsyncStorage.
export const tokenStorage = {
  getAccess: () => get(ACCESS),
  getRefresh: () => get(REFRESH),
  async setTokens(accessToken: string, refreshToken: string) {
    await Promise.all([set(ACCESS, accessToken), set(REFRESH, refreshToken)]);
  },
  async clear() {
    await Promise.all([del(ACCESS), del(REFRESH)]);
  },
};
