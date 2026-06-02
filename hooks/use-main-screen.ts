import { useCallback, useRef, useState } from 'react';

import { DEFAULT_CONNECTIONS, FEEDBACK_DISPLAY_MS, MIN_CONNECTIONS } from '@/constants/app';
import type {
  ConfirmPayload,
  DownloadProgress,
  FeedbackMessage,
  OperationStatus,
} from '@/types';
import { handleConfirm } from '@/utils/confirm-handler';
import { validateAddress } from '@/utils/validation';

/**
 * Encapsulates all main-screen state and logic:
 * - address input + validation
 * - connection counter (with min constraint)
 * - submit operation (loading / feedback / download progress)
 */
export function useMainScreen() {
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [connections, setConnections] = useState(DEFAULT_CONNECTIONS);
  const [status, setStatus] = useState<OperationStatus>('idle');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Address helpers ──────────────────────────────────────────
  const onAddressChange = useCallback((text: string) => {
    setAddress(text);
    // Clear error as the user types
    if (text.trim().length > 0) {
      setAddressError(null);
    }
  }, []);

  // ── Counter helpers ──────────────────────────────────────────
  const increment = useCallback(() => {
    setConnections((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setConnections((prev) => Math.max(MIN_CONNECTIONS, prev - 1));
  }, []);

  // ── Submit ───────────────────────────────────────────────────
  const isAddressValid =
    address.trim().length > 0 && validateAddress(address) === null;

  const submit = useCallback(async () => {
    // Validate
    const error = validateAddress(address);
    if (error) {
      setAddressError(error);
      return;
    }

    setAddressError(null);
    setFeedback(null);
    setDownloadProgress(null);
    setStatus('loading');

    const payload: ConfirmPayload = {
      targetAddress: address.trim(),
      connections,
    };

    try {
      const result = await handleConfirm(payload, (progress) => {
        setDownloadProgress(progress);
      });

      if (result.success) {
        setStatus('success');
        setFeedback({ type: 'success', text: result.message });
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setStatus('error');
        setFeedback({ type: 'error', text: result.message });
      }
    } catch {
      setStatus('error');
      setFeedback({ type: 'error', text: 'An unexpected error occurred.' });
    }

    // Auto-dismiss feedback after delay
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      setFeedback(null);
      setDownloadProgress(null);
      setStatus('idle');
    }, FEEDBACK_DISPLAY_MS);
  }, [address, connections]);

  return {
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
  } as const;
}
