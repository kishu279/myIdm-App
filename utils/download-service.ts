// import { Directory, File, Paths } from "expo-file-system";
import { Directory, File, Paths } from "expo-file-system/next";
import * as MediaLibrary from "expo-media-library";

import {
  ALLOWED_HOSTS,
  DOWNLOADS_DIR_NAME,
  PRIVATE_IP_REGEX,
} from "@/constants/app";
import type {
  ChunkMetadata,
  ChunkSnapshot,
  ConfirmResult,
  DownloadMetadata,
  DownloadProgress,
} from "@/types";

// ── Helpers ──────────────────────────────────────────────────

/** Returns the downloads Directory instance. */
export function getDownloadsDir(): Directory {
  return new Directory(Paths.document, DOWNLOADS_DIR_NAME);
}

/**
 * Ensures the downloads directory exists.
 */
function ensureDownloadsDir(): void {
  const dir = getDownloadsDir();
  if (!dir.exists) {
    dir.create();
  }
}

/**
 * Extracts a safe filename from a URL.
 */
function extractFileName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const raw = pathname.split("/").pop() ?? "download";
    return raw.replace(/\.\./g, "").replace(/[/\\]/g, "") || "download";
  } catch {
    return "download";
  }
}

/**
 * Validates a URL against the allowlist and blocks private IPs.
 * Throws if the URL is not allowed.
 */
function validateUrl(url: string): void {
  const parsed = new URL(url);

  if (ALLOWED_HOSTS.length > 0 && !ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error(`Untrusted host: ${parsed.hostname}`);
  }

  if (PRIVATE_IP_REGEX.test(parsed.hostname)) {
    throw new Error(`Private/internal host not allowed: ${parsed.hostname}`);
  }
}

/**
 * Converts bytes to a human-readable string (e.g. "12.4 MB").
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Creates a lightweight snapshot array for the UI from live ChunkMetadata.
 */
function snapshotChunks(chunks: ChunkMetadata[]): ChunkSnapshot[] {
  return chunks.map((c) => ({
    id: c.id,
    totalBytes: c.end - c.start + 1,
    downloaded: c.downloaded,
    status: c.status,
  }));
}

/**
 * Retrieves all completed files from the downloads directory.
 */
export function getDownloadedFiles() {
  try {
    const dir = getDownloadsDir();
    if (!dir.exists) return [];

    return dir
      .list()
      .filter((f): f is File => f instanceof File && !f.name.endsWith(".tmp"))
      .map((f) => ({
        name: f.name,
        size: f.size,
        uri: f.uri,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/**
 * Deletes a file from the downloads directory.
 */
export function deleteDownloadedFile(fileName: string): boolean {
  try {
    const file = new File(getDownloadsDir(), fileName);
    if (file.exists) {
      file.delete();
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

// ── Header Check ─────────────────────────────────────────────

/**
 * Sends a partial GET request (Range: bytes=0-100) to probe server support
 * for range requests and extract file metadata.
 */
async function headerCheck(url: string): Promise<DownloadMetadata | null> {
  validateUrl(url);

  const response = await fetch(url, {
    method: "GET",
    headers: { Range: "bytes=0-100" },
  });

  if (response.status === 206 && response.headers.has("content-range")) {
    const contentRange = response.headers.get("content-range") ?? "";
    const totalSizeStr = contentRange.split("/")[1];
    if (!totalSizeStr || totalSizeStr === "*") return null;

    const totalSize = parseInt(totalSizeStr, 10);
    if (isNaN(totalSize) || totalSize <= 0) return null;

    return {
      url,
      fileName: extractFileName(url),
      totalSize,
      contentType: response.headers.get("content-type") ?? "",
      supportsRange: response.headers.get("accept-ranges") === "bytes",
      etag: response.headers.get("etag") ?? undefined,
      lastModified: response.headers.get("last-modified") ?? undefined,
      chunks: [],
    };
  }

  // Fallback: HEAD request for non-Range servers
  const headResponse = await fetch(url, { method: "HEAD" });
  const contentLength = headResponse.headers.get("content-length");
  const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

  if (totalSize > 0) {
    return {
      url,
      fileName: extractFileName(url),
      totalSize,
      contentType: headResponse.headers.get("content-type") ?? "",
      supportsRange: false,
      etag: headResponse.headers.get("etag") ?? undefined,
      lastModified: headResponse.headers.get("last-modified") ?? undefined,
      chunks: [],
    };
  }

  return null;
}

// ── Chunk Download ───────────────────────────────────────────

/**
 * Downloads a specific byte range using streaming to avoid OOM.
 */
async function downloadChunk(
  url: string,
  chunk: ChunkMetadata,
  onChunkDone: (chunkId: number, downloadedBytes: number) => void,
): Promise<void> {
  validateUrl(url);

  const tempFile = new File(chunk.tempUri);

  // Use File.downloadFileAsync for streaming download
  const downloaded = await File.downloadFileAsync(url, tempFile, {
    headers: { Range: `bytes=${chunk.start}-${chunk.end}` },
  });

  if (!downloaded.exists) {
    throw new Error(`Chunk ${chunk.id} download failed`);
  }

  onChunkDone(chunk.id, downloaded.size);
}

/**
 * Downloads the entire file in a single request (fallback when Range not supported).
 * Uses File.downloadFileAsync which streams directly to disk.
 */
async function downloadFull(
  url: string,
  destFile: File,
  onProgress: (downloadedBytes: number) => void,
): Promise<void> {
  // downloadFileAsync takes a Directory or File as destination
  const downloaded = await File.downloadFileAsync(url, destFile, {
    idempotent: true,
  });

  if (!downloaded.exists) {
    throw new Error("Download failed — file was not created.");
  }

  onProgress(downloaded.size);
}

// ── Merge Chunks ─────────────────────────────────────────────

/**
 * Merges chunks by streaming them sequentially without loading into memory.
 */
async function mergeChunks(
  metadata: DownloadMetadata,
  finalFile: File,
): Promise<void> {
  if (finalFile.exists) finalFile.delete();
  if (metadata.chunks.length === 0) return;

  // Copy first chunk to create the file
  const firstChunkFile = new File(metadata.chunks[0].tempUri);
  await firstChunkFile.copy(finalFile);
  const firstInfo = await firstChunkFile.info();
  firstChunkFile.delete();

  // Open final file for appending
  const handle = await finalFile.open();
  try {
    // Stream remaining chunks
    for (let i = 1; i < metadata.chunks.length; i++) {
      const chunkFile = new File(metadata.chunks[i].tempUri);
      const chunkHandle = await chunkFile.open();

      try {
        // Stream in 1MB blocks
        while (true) {
          const buffer = await chunkHandle.readBytes(1024 * 1024);
          if (buffer.length === 0) break;

          await handle.writeBytes(buffer);
        }
      } finally {
        await chunkHandle.close();
        await chunkFile.delete();
      }
    }
  } finally {
    await handle.close();
  }
}

// ── Media Library ────────────────────────────────────────────

/**
 * Requests media library permission and saves the file to the
 * public Downloads folder (/storage/emulated/0/Download/).
 * Deletes the private temp file afterwards.
 */
async function saveToPublicDownloads(file: File): Promise<void> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Storage permission denied — cannot save to Downloads.");
  }

  const asset = await MediaLibrary.createAssetAsync(file.uri);
  await MediaLibrary.createAlbumAsync("Download", asset, false);

  // Remove the private copy
  if (file.exists) file.delete();
}

// ── Orchestrator ─────────────────────────────────────────────

/**
 * Orchestrates the full download process:
 * 1. Header check (probe Range support + file metadata)
 * 2. Split into chunks based on connection count
 * 3. Download all chunks concurrently
 * 4. Merge chunks into final file
 * 5. Move to public Downloads folder
 */
export async function startDownload(
  url: string,
  connections: number,
  onProgress: (progress: DownloadProgress) => void,
): Promise<ConfirmResult> {
  try {
    // ── Phase 1: Checking ──────────────────────────────────
    onProgress({
      totalBytes: 0,
      downloadedBytes: 0,
      chunksCompleted: 0,
      chunksTotal: 0,
      phase: "checking",
      detail: "Checking server support…",
    });

    ensureDownloadsDir();

    const metadata = await headerCheck(url);

    if (!metadata) {
      return {
        success: false,
        message: "Could not retrieve file info from the server.",
      };
    }

    const downloadsDir = getDownloadsDir();
    const finalFile = new File(downloadsDir, metadata.fileName);

    // ── Non-range fallback: single connection download ────
    if (!metadata.supportsRange) {
      onProgress({
        totalBytes: metadata.totalSize,
        downloadedBytes: 0,
        chunksCompleted: 0,
        chunksTotal: 1,
        phase: "downloading",
        detail: `Downloading ${metadata.fileName} (single connection)…`,
      });

      await downloadFull(metadata.url, finalFile, (downloaded) => {
        onProgress({
          totalBytes: metadata.totalSize,
          downloadedBytes: downloaded,
          chunksCompleted: 0,
          chunksTotal: 1,
          phase: "downloading",
          detail: `${formatBytes(downloaded)} / ${formatBytes(metadata.totalSize)}`,
        });
      });

      onProgress({
        totalBytes: metadata.totalSize,
        downloadedBytes: metadata.totalSize,
        chunksCompleted: 1,
        chunksTotal: 1,
        phase: "done",
        detail: metadata.fileName,
      });

      await saveToPublicDownloads(finalFile);

      return {
        success: true,
        message: `Downloaded "${metadata.fileName}" (${formatBytes(metadata.totalSize)})`,
      };
    }

    // ── Phase 2: Split into chunks ────────────────────────
    const effectiveConnections = Math.min(connections, 16); // Cap at 16
    const eachChunkSize = Math.ceil(metadata.totalSize / effectiveConnections);
    const timestamp = Date.now();

    for (let i = 0; i < effectiveConnections; i++) {
      const start = i * eachChunkSize;
      const end = Math.min((i + 1) * eachChunkSize - 1, metadata.totalSize - 1);

      metadata.chunks.push({
        id: i,
        start,
        end,
        downloaded: 0,
        status: "pending",
        tempUri: new File(downloadsDir, `chunk_${i}_${timestamp}.tmp`).uri,
      });
    }

    // ── Phase 3: Download chunks concurrently ─────────────
    let totalDownloaded = 0;
    let chunksCompleted = 0;

    onProgress({
      totalBytes: metadata.totalSize,
      downloadedBytes: 0,
      chunksCompleted: 0,
      chunksTotal: metadata.chunks.length,
      phase: "downloading",
      detail: `Downloading ${metadata.fileName} with ${metadata.chunks.length} connections…`,
      chunks: snapshotChunks(metadata.chunks),
    });

    const onChunkDone = (chunkId: number, bytes: number) => {
      const chunk = metadata.chunks[chunkId];
      chunk.downloaded = bytes;
      chunk.status = "completed";
      totalDownloaded += bytes;
      chunksCompleted++;

      onProgress({
        totalBytes: metadata.totalSize,
        downloadedBytes: totalDownloaded,
        chunksCompleted,
        chunksTotal: metadata.chunks.length,
        phase: "downloading",
        detail: `${formatBytes(totalDownloaded)} / ${formatBytes(metadata.totalSize)}`,
        chunks: snapshotChunks(metadata.chunks),
      });
    };

    // Download chunks with concurrency limit to avoid OOM
    const MAX_CONCURRENT = 4;
    const results: PromiseSettledResult<void>[] = [];

    for (let i = 0; i < metadata.chunks.length; i += MAX_CONCURRENT) {
      const batch = metadata.chunks.slice(i, i + MAX_CONCURRENT);
      const batchResults = await Promise.allSettled(
        batch.map((chunk) => {
          chunk.status = "downloading";
          return downloadChunk(metadata.url, chunk, onChunkDone);
        }),
      );
      results.push(...batchResults);
    }

    // Check for failures
    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    if (failures.length > 0) {
      // Clean up any temp files
      for (const chunk of metadata.chunks) {
        try {
          const tempFile = new File(chunk.tempUri);
          if (tempFile.exists) tempFile.delete();
        } catch {
          // Best-effort
        }
      }

      const reason = (failures[0].reason as Error).message ?? "Unknown error";
      return {
        success: false,
        message: `Download failed: ${failures.length} chunk(s) failed. ${reason}`,
      };
    }

    // ── Phase 4: Merge ───────────────────────────────────
    onProgress({
      totalBytes: metadata.totalSize,
      downloadedBytes: metadata.totalSize,
      chunksCompleted: metadata.chunks.length,
      chunksTotal: metadata.chunks.length,
      phase: "merging",
      detail: "Merging chunks…",
    });

    await mergeChunks(metadata, finalFile);

    // ── Done ─────────────────────────────────────────────
    onProgress({
      totalBytes: metadata.totalSize,
      downloadedBytes: metadata.totalSize,
      chunksCompleted: metadata.chunks.length,
      chunksTotal: metadata.chunks.length,
      phase: "done",
      detail: metadata.fileName,
    });

    await saveToPublicDownloads(finalFile);

    return {
      success: true,
      message: `Downloaded "${metadata.fileName}" (${formatBytes(metadata.totalSize)}) with ${metadata.chunks.length} connections.`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    onProgress({
      totalBytes: 0,
      downloadedBytes: 0,
      chunksCompleted: 0,
      chunksTotal: 0,
      phase: "error",
      detail: message,
    });

    return {
      success: false,
      message,
    };
  }
}
