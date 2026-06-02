/**
 * Application type definitions.
 */

// ── Confirm Flow ──────────────────────────────────────────────

/** Result of a confirm submission. */
export interface ConfirmResult {
  success: boolean;
  message: string;
}

/** Payload sent when the user confirms. */
export interface ConfirmPayload {
  targetAddress: string;
  connections: number;
}

/** Possible states for an async operation. */
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

/** Feedback message shown after a confirm action. */
export interface FeedbackMessage {
  type: 'success' | 'error';
  text: string;
}

// ── Download Types ────────────────────────────────────────────

/** State of a single download chunk. */
export interface ChunkMetadata {
  id: number;
  start: number;
  end: number;
  downloaded: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  /** expo-file-system URI for the temp chunk file. */
  tempUri: string;
}

/** Lightweight snapshot of a chunk's progress — pushed to the UI. */
export interface ChunkSnapshot {
  id: number;
  /** Chunk size in bytes (end - start + 1). */
  totalBytes: number;
  /** Bytes received so far. */
  downloaded: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}

/** Metadata from the server header check (Range support probe). */
export interface DownloadMetadata {
  url: string;
  fileName: string;
  totalSize: number;
  contentType: string;
  supportsRange: boolean;
  etag?: string;
  lastModified?: string;
  chunks: ChunkMetadata[];
}

/** Download phase labels. */
export type DownloadPhase =
  | 'checking'
  | 'downloading'
  | 'merging'
  | 'done'
  | 'error';

/** Progress info pushed to the UI during download. */
export interface DownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  chunksCompleted: number;
  chunksTotal: number;
  phase: DownloadPhase;
  /** Optional message (e.g. file name, error detail). */
  detail?: string;
  /** Per-chunk live snapshots — present only during 'downloading' phase. */
  chunks?: ChunkSnapshot[];
}

/** Information about a completed download file on disk. */
export interface DownloadedFile {
  name: string;
  size: number;
  uri: string;
}
