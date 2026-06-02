/**
 * Application-wide constants.
 */

/** Minimum allowed value for the connection counter. */
export const MIN_CONNECTIONS = 1;

/** Default number of connections. */
export const DEFAULT_CONNECTIONS = 4;

/** Maximum recommended connections. */
export const MAX_CONNECTIONS = 8;

/** Maximum file size in bytes (5GB - with largeHeap enabled). */
export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

/** Maximum recommended connections based on file size. */
export const MAX_CONNECTIONS_BY_SIZE = {
  small: 8,   // < 50MB
  medium: 6,  // 50-200MB
  large: 4,   // 200MB-1GB
  xlarge: 2,  // > 1GB
} as const;

/** Simulated operation delay in milliseconds (kept for non-download paths). */
export const OPERATION_DELAY_MS = 1500;

/** How long feedback messages stay visible (ms). */
export const FEEDBACK_DISPLAY_MS = 6000;

/** App title shown in the header. */
export const APP_TITLE = 'myIdm';

/**
 * Hosts allowed for downloads.
 * Empty array = allow all hosts.
 */
export const ALLOWED_HOSTS: string[] = [
  'releases.ubuntu.com',
  'vikingfile.com',
];

/** Regex to block private/internal IP addresses used in URLs. */
export const PRIVATE_IP_REGEX =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/;

/** Subdirectory name inside documentDirectory for downloads. */
export const DOWNLOADS_DIR_NAME = 'downloads';

/** Spacing scale (multiples of 4). */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Border radius values. */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
