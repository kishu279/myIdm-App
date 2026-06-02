import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/app';
import { useTheme } from '@/hooks/use-theme-color';
import type {
  ChunkSnapshot,
  DownloadProgress as DownloadProgressType,
} from '@/types';
import { formatBytes } from '@/utils/download-service';

interface DownloadProgressProps {
  progress: DownloadProgressType;
}

const PHASE_LABELS: Record<DownloadProgressType['phase'], string> = {
  checking: 'Checking server…',
  downloading: 'Downloading…',
  merging: 'Merging chunks…',
  done: 'Complete',
  error: 'Failed',
};

const PHASE_ICONS: Record<DownloadProgressType['phase'], string> = {
  checking: '🔍',
  downloading: '⬇️',
  merging: '🔗',
  done: '✅',
  error: '❌',
};

// ── Per-chunk row ─────────────────────────────────────────────

interface ChunkRowProps {
  chunk: ChunkSnapshot;
  totalFileBytes: number;
  theme: ReturnType<typeof useTheme>;
}

function ChunkRow({ chunk, totalFileBytes, theme }: ChunkRowProps) {
  const fraction =
    chunk.totalBytes > 0 ? chunk.downloaded / chunk.totalBytes : 0;
  const animWidth = useSharedValue(0);

  useEffect(() => {
    animWidth.value = withTiming(fraction, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [fraction, animWidth]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animWidth.value * 100}%` as `${number}%`,
  }));

  // Proportional flex — chunk's share of the total file
  const proportion =
    totalFileBytes > 0 ? chunk.totalBytes / totalFileBytes : 1;

  const barColor =
    chunk.status === 'completed'
      ? theme.success
      : chunk.status === 'failed'
        ? theme.error
        : theme.tint;

  const trackColor =
    chunk.status === 'completed'
      ? theme.successBackground
      : chunk.status === 'failed'
        ? theme.errorBackground
        : theme.counterBackground;

  const pct = Math.round(fraction * 100);

  return (
    <View style={chunkStyles.row}>
      {/* Chunk ID label */}
      <Text style={[chunkStyles.id, { color: theme.textSecondary }]}>
        #{chunk.id}
      </Text>

      {/* Proportionally-sized bar track */}
      <View style={[chunkStyles.trackOuter, { flex: proportion }]}>
        <View style={[chunkStyles.track, { backgroundColor: trackColor }]}>
          <Animated.View
            style={[chunkStyles.fill, barStyle, { backgroundColor: barColor }]}
          />
        </View>
      </View>

      {/* Percentage */}
      <Text style={[chunkStyles.pct, { color: theme.textSecondary }]}>
        {pct}%
      </Text>

      {/* Downloaded bytes */}
      <Text style={[chunkStyles.bytes, { color: theme.textSecondary }]}>
        {formatBytes(chunk.downloaded)}
      </Text>
    </View>
  );
}

const chunkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 22,
  },
  id: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },
  trackOuter: {
    // flex is set inline based on chunk proportion
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    minWidth: 2,
  },
  pct: {
    fontSize: 10,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  bytes: {
    fontSize: 10,
    fontWeight: '400',
    width: 52,
    textAlign: 'right',
  },
});

// ── Main progress bar ─────────────────────────────────────────

export function DownloadProgressBar({ progress }: DownloadProgressProps) {
  const theme = useTheme();
  const fraction =
    progress.totalBytes > 0
      ? progress.downloadedBytes / progress.totalBytes
      : 0;
  const percent = Math.round(fraction * 100);

  // Animated overall progress bar width
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(fraction, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [fraction, animatedWidth]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%` as `${number}%`,
  }));

  const isDone = progress.phase === 'done';
  const isError = progress.phase === 'error';

  const barColor = isError
    ? theme.error
    : isDone
      ? theme.success
      : theme.tint;

  const barTrackColor = isError
    ? theme.errorBackground
    : isDone
      ? theme.successBackground
      : theme.counterBackground;

  const showChunks =
    progress.phase === 'downloading' &&
    progress.chunks &&
    progress.chunks.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
        },
      ]}
    >
      {/* Phase header */}
      <View style={styles.headerRow}>
        <Text style={styles.phaseIcon}>{PHASE_ICONS[progress.phase]}</Text>
        <Text style={[styles.phaseLabel, { color: theme.text }]}>
          {PHASE_LABELS[progress.phase]}
        </Text>
        {progress.totalBytes > 0 && (
          <Text style={[styles.percent, { color: theme.tint }]}>
            {percent}%
          </Text>
        )}
      </View>

      {/* Overall progress bar */}
      {progress.totalBytes > 0 && (
        <View style={[styles.barTrack, { backgroundColor: barTrackColor }]}>
          <Animated.View
            style={[
              styles.barFill,
              barStyle,
              { backgroundColor: barColor },
            ]}
          />
        </View>
      )}

      {/* Detail row */}
      <View style={styles.detailRow}>
        {progress.totalBytes > 0 && (
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {formatBytes(progress.downloadedBytes)} /{' '}
            {formatBytes(progress.totalBytes)}
          </Text>
        )}
        {progress.chunksTotal > 0 && (
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {progress.chunksCompleted}/{progress.chunksTotal} chunks
          </Text>
        )}
      </View>

      {/* ── Per-chunk grid ── */}
      {showChunks && (
        <View
          style={[
            styles.chunkGrid,
            { borderTopColor: theme.surfaceBorder },
          ]}
        >
          <Text style={[styles.chunkGridLabel, { color: theme.textSecondary }]}>
            Chunks
          </Text>
          {progress.chunks!.map((chunk) => (
            <ChunkRow
              key={chunk.id}
              chunk={chunk}
              totalFileBytes={progress.totalBytes}
              theme={theme}
            />
          ))}
        </View>
      )}

      {/* Detail message */}
      {progress.detail && (
        <Text
          style={[styles.message, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {progress.detail}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  phaseIcon: {
    fontSize: 16,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
    minWidth: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // ── Chunk grid ──
  chunkGrid: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  chunkGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  // ──
  message: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
});
