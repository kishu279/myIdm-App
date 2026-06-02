import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ConfirmButton } from '@/components/ConfirmButton';
import { Counter } from '@/components/Counter';
import { DownloadedFilesList } from '@/components/DownloadedFiles';
import { DownloadProgressBar } from '@/components/DownloadProgress';
import { InputField } from '@/components/InputField';
import { WelcomeModal } from '@/components/WelcomeModal';
import { APP_TITLE, Radius, Spacing } from '@/constants/app';
import { useMainScreen } from '@/hooks/use-main-screen';
import { useTheme } from '@/hooks/use-theme-color';

export default function MainScreen() {
  const theme = useTheme();
  const [showWelcome, setShowWelcome] = useState(true);

  const {
    address,
    addressError,
    onAddressChange,
    connections,
    increment,
    decrement,
    status,
    feedback,
    downloadProgress,
    refreshTrigger,
    isAddressValid,
    submit,
  } = useMainScreen();

  const isDownloading = status === 'loading';

  return (
    <>
      {/* ── Welcome Modal (shows first) ──────────────────── */}
      <WelcomeModal
        visible={showWelcome}
        onDismiss={() => setShowWelcome(false)}
      />

      {/* ── Main Screen ─────────────────────────────────── */}
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {APP_TITLE}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Multi-connection download manager
            </Text>
          </View>

          {/* ── Card (centered, no spring animation) ────────── */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                shadowColor: theme.shadow,
              },
            ]}
          >
            {/* Input Section */}
            <InputField
              value={address}
              onChangeText={onAddressChange}
              placeholder="https://example.com/file.zip"
              label="Target URL"
              error={addressError}
              editable={!isDownloading}
            />

            {/* Divider */}
            <View
              style={[styles.divider, { backgroundColor: theme.surfaceBorder }]}
            />

            {/* Counter Section */}
            <Counter
              value={connections}
              onIncrement={isDownloading ? undefined! : increment}
              onDecrement={isDownloading ? undefined! : decrement}
              label="Connections"
            />

            {/* Divider */}
            <View
              style={[styles.divider, { backgroundColor: theme.surfaceBorder }]}
            />

            {/* Confirm Section */}
            <ConfirmButton
              onPress={submit}
              loading={isDownloading}
              disabled={!isAddressValid}
              label={isDownloading ? 'Downloading…' : 'Confirm'}
            />
          </View>

          {/* ── Download Progress ──────────────────────────── */}
          {downloadProgress && downloadProgress.phase !== 'done' ? (
            <Animated.View
              entering={FadeIn.duration(250)}
              style={styles.progressContainer}
            >
              <DownloadProgressBar progress={downloadProgress} />
            </Animated.View>
          ) : null}

          {/* ── Feedback Message ────────────────────────────── */}
          {feedback ? (
            <Animated.View
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(200)}
              style={[
                styles.feedback,
                {
                  backgroundColor:
                    feedback.type === 'success'
                      ? theme.successBackground
                      : theme.errorBackground,
                  borderColor:
                    feedback.type === 'success' ? theme.success : theme.error,
                },
              ]}
            >
              <Text
                style={[
                  styles.feedbackIcon,
                  {
                    color:
                      feedback.type === 'success'
                        ? theme.success
                        : theme.error,
                  },
                ]}
              >
                {feedback.type === 'success' ? '✓' : '✗'}
              </Text>
              <Text
                style={[
                  styles.feedbackText,
                  {
                    color:
                      feedback.type === 'success'
                        ? theme.success
                        : theme.error,
                  },
                ]}
                accessibilityRole="alert"
              >
                {feedback.text}
              </Text>
            </Animated.View>
          ) : null}

          {/* ── Downloaded Files List ─────────────────────── */}
          <DownloadedFilesList refreshTrigger={refreshTrigger} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl + 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: Spacing.xs,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    gap: Spacing.xl,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  progressContainer: {
    marginTop: Spacing.lg,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  feedbackIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
