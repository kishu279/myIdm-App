import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { APP_TITLE, Radius, Spacing } from '@/constants/app';
import { useTheme } from '@/hooks/use-theme-color';

interface WelcomeModalProps {
  /** Whether the modal is visible. */
  visible: boolean;
  /** Called when the user dismisses the modal. */
  onDismiss: () => void;
}

export function WelcomeModal({ visible, onDismiss }: WelcomeModalProps) {
  const theme = useTheme();

  // ── Animated logo ring ──────────────────────────────────────
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      // Reset
      ringScale.value = 0.6;
      ringOpacity.value = 0;
      contentOpacity.value = 0;
      buttonTranslateY.value = 20;

      // Sequence
      ringOpacity.value = withTiming(1, { duration: 400 });
      ringScale.value = withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      });
      contentOpacity.value = withDelay(
        350,
        withTiming(1, { duration: 400 }),
      );
      buttonTranslateY.value = withDelay(
        500,
        withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [visible, ringScale, ringOpacity, contentOpacity, buttonTranslateY]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={[styles.overlay, { backgroundColor: theme.background }]}>
        {/* Logo Ring */}
        <Animated.View
          style={[
            styles.logoRing,
            ringStyle,
            {
              borderColor: theme.tint,
              backgroundColor: theme.tintMuted,
            },
          ]}
        >
          <Text style={[styles.logoEmoji]}>🔗</Text>
        </Animated.View>

        {/* Title & Subtitle */}
        <Animated.View style={[styles.textContainer, contentStyle]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {APP_TITLE}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Fast & simple connection manager{'\n'}for your target addresses
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.features, contentStyle]}>
          {[
            { icon: '🎯', text: 'Set target address' },
            { icon: '🔢', text: 'Configure connections' },
            { icon: '⚡', text: 'Instant confirmation' },
          ].map((item) => (
            <Animated.View
              key={item.text}
              entering={FadeIn.duration(300)}
              style={[
                styles.featureRow,
                { backgroundColor: theme.counterBackground },
              ]}
            >
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                {item.text}
              </Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
          <Pressable
            onPress={onDismiss}
            accessibilityLabel="Get Started"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.tint,
                transform: [{ scale: pressed ? 0.96 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoEmoji: {
    fontSize: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl + 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  features: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
