import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Radius, Spacing } from '@/constants/app';
import { useTheme } from '@/hooks/use-theme-color';
import type { DownloadedFile } from '@/types';
import {
  deleteDownloadedFile,
  formatBytes,
  getDownloadedFiles,
} from '@/utils/download-service';

interface Props {
  /** Bump this number to refresh the list */
  refreshTrigger: number;
}

export function DownloadedFilesList({ refreshTrigger }: Props) {
  const theme = useTheme();
  const [files, setFiles] = useState<DownloadedFile[]>([]);

  const loadFiles = useCallback(() => {
    setFiles(getDownloadedFiles());
  }, []);

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger, loadFiles]);

  const handleDelete = (name: string) => {
    if (deleteDownloadedFile(name)) {
      loadFiles();
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        Downloaded Files
      </Text>
      <View
        style={[
          styles.list,
          {
            backgroundColor: theme.surface,
            borderColor: theme.surfaceBorder,
          },
        ]}
      >
        {files.map((file, index) => (
          <View
            key={file.uri}
            style={[
              styles.item,
              index > 0 && {
                borderTopWidth: 1,
                borderTopColor: theme.surfaceBorder,
              },
            ]}
          >
            <View style={styles.info}>
              <Text
                style={[styles.name, { color: theme.text }]}
                numberOfLines={1}
              >
                {file.name}
              </Text>
              <Text style={[styles.size, { color: theme.textSecondary }]}>
                {formatBytes(file.size)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(file.name)}
              style={styles.deleteBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteText, { color: theme.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  list: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  size: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  deleteBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
