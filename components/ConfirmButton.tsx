import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { Radius, Spacing } from '@/constants/app';
import { useTheme } from '@/hooks/use-theme-color';

interface ConfirmButtonProps {
  /** Called when the button is pressed. */
  onPress: () => void;
  /** Button label. */
  label?: string;
  /** Whether an operation is in progress. */
  loading?: boolean;
  /** Whether the button is disabled (e.g. invalid form). */
  disabled?: boolean;
}

export function ConfirmButton({
  onPress,
  label = 'Confirm',
  loading = false,
  disabled = false,
}: ConfirmButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDisabled ? theme.disabled : theme.tint,
          transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }],
          opacity: pressed && !isDisabled ? 0.9 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isDisabled ? theme.disabledText : '#FFFFFF' },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
