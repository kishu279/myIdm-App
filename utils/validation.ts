/**
 * Validates the target address input.
 * Returns an error message string or null if valid.
 */
export function validateAddress(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return 'Target address is required.';
  }

  // Must be a valid URL
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Only HTTP/HTTPS URLs are supported.';
    }
  } catch {
    return 'Please enter a valid URL.';
  }

  return null;
}
