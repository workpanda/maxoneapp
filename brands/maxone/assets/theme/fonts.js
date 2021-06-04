/**
 * App Theme - Fonts
 */
import { Platform } from 'react-native';

function lineHeight(fontSize) {
  const multiplier = fontSize > 20 ? 0.1 : 0.33;
  return parseInt(fontSize + fontSize * multiplier, 10);
}

const base = {
  size: 14,
  lineHeight: lineHeight(14),
};

export default {
  base: { ...base },
  h1: { fontSize: 24, lineHeight: (Platform.OS === 'ios') ? 26 : 36 },
  h2: { fontSize: 20, lineHeight: 20 },
  h3: { fontSize: 14, lineHeight: 14 },
};