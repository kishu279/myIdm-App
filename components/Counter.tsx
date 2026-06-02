import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_CONNECTIONS, Radius, Spacing } from '@/constants/app';
import { useTheme } from '@/hooks/use-theme-color';

interface CounterProps {
  /** Current counter value. */
  value: number;
  /** Called when the user presses +. */
  onIncrement: () => void;
  /** Called when the user presses −. */
  onDecrement: () => void;
  /** Label displayed above the counter. */
  label?: string;
}

export function Counter({
  value,
  onIncrement,
  onDecrement,
  label = 'Connections',
}: CounterProps) {
  const theme = useTheme();
  const isAtMinimum = value <= MIN_CONNECTIONS;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.row,
          { backgroundColor: theme.counterBackground, borderColor: theme.surfaceBorder },
        ]}
      >
        {/* Decrement */}
        <Pressable
          onPress={onDecrement}
          disabled={isAtMinimum}
          accessibilityLabel="Decrease connections"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed
                ? theme.tintMuted
                : theme.counterButtonBackground,
              opacity: isAtMinimum ? 0.35 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: isAtMinimum ? theme.disabledText : theme.tint },
            ]}
          >
            −
          </Text>
        </Pressable>

        {/* Value */}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        </View>

        {/* Increment */}
        <Pressable
          onPress={onIncrement}
          accessibilityLabel="Increase connections"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed
                ? theme.tintMuted
                : theme.counterButtonBackground,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: theme.tint }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
