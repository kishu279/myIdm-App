import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/app';
import { useTheme } from '@/hooks/use-theme-color';

interface InputFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  /** Current field value. */
  value: string;
  /** Called with the new text whenever the user types. */
  onChangeText: (text: string) => void;
  /** Error message to display under the input (if any). */
  error?: string | null;
  /** Label shown above the input. */
  label?: string;
}

export function InputField({
  value,
  onChangeText,
  error,
  label,
  placeholder,
  ...rest
}: InputFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const borderColor = error
    ? theme.error
    : focused
      ? theme.inputFocusBorder
      : theme.inputBorder;

  return (
    <View style={styles.container}>
      {label ? (
        <Animated.Text
          entering={FadeIn.duration(200)}
          style={[styles.label, { color: theme.textSecondary }]}
        >
          {label}
        </Animated.Text>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: theme.surface,
          },
          focused && {
            shadowColor: theme.tint,
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.disabledText}
          style={[styles.input, { color: theme.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          accessibilityLabel={label ?? placeholder}
          {...rest}
        />
      </View>

      {error ? (
        <Animated.Text
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.errorText, { color: theme.error }]}
          accessibilityRole="alert"
        >
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  input: {
    fontSize: 16,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    minHeight: 52,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: Spacing.xs + 2,
    marginLeft: Spacing.xs,
  },
});
