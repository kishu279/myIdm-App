import type { ConfirmPayload, ConfirmResult, DownloadProgress } from '@/types';
import { startDownload } from '@/utils/download-service';

/**
 * Handles the confirm action by starting the chunked download.
 *
 * @param payload  - Contains the target URL and number of connections.
 * @param onProgress - Callback invoked with download progress updates.
 */
export async function handleConfirm(
  payload: ConfirmPayload,
  onProgress: (progress: DownloadProgress) => void,
): Promise<ConfirmResult> {
  return startDownload(
    payload.targetAddress.trim(),
    payload.connections,
    onProgress,
  );
}
