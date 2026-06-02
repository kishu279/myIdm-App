/**
 * Extended theme colors and design tokens for the app.
 * The base Colors and Fonts from the original theme are re-exported for convenience.
 */

import { Platform } from 'react-native';

const tintColorLight = '#6C5CE7';
const tintColorDark = '#A29BFE';

export const Colors = {
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    background: '#F0F2F5',
    surface: '#FFFFFF',
    surfaceBorder: 'rgba(0, 0, 0, 0.06)',
    tint: tintColorLight,
    tintMuted: 'rgba(108, 92, 231, 0.08)',
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorLight,
    error: '#E74C3C',
    errorBackground: 'rgba(231, 76, 60, 0.08)',
    success: '#00B894',
    successBackground: 'rgba(0, 184, 148, 0.08)',
    counterBackground: 'rgba(108, 92, 231, 0.06)',
    counterButtonBackground: 'rgba(108, 92, 231, 0.1)',
    disabled: '#D1D5DB',
    disabledText: '#9CA3AF',
    inputBorder: '#E5E7EB',
    inputFocusBorder: tintColorLight,
    shadow: 'rgba(0, 0, 0, 0.06)',
  },
  dark: {
    text: '#F1F2F6',
    textSecondary: '#9CA3AF',
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceBorder: 'rgba(255, 255, 255, 0.06)',
    tint: tintColorDark,
    tintMuted: 'rgba(162, 155, 254, 0.1)',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorDark,
    error: '#FF6B6B',
    errorBackground: 'rgba(255, 107, 107, 0.12)',
    success: '#55EFC4',
    successBackground: 'rgba(85, 239, 196, 0.12)',
    counterBackground: 'rgba(162, 155, 254, 0.08)',
    counterButtonBackground: 'rgba(162, 155, 254, 0.15)',
    disabled: '#374151',
    disabledText: '#6B7280',
    inputBorder: '#2D2D44',
    inputFocusBorder: tintColorDark,
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
