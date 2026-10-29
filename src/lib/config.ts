const url = process.env.EXPO_PUBLIC_API_URL;

if (!url) {
  console.warn('EXPO_PUBLIC_API_URL is not set. Add it to .env and restart Expo with: npx expo start -c');
}

// e.g. https://xxxx-3001.inc1.devtunnels.ms/api (no trailing slash)
export const API_URL = (url ?? '').replace(/\/$/, '');
