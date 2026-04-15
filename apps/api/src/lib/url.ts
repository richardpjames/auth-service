export function sanitizeReturnTo(returnTo: unknown, fallback = '/'): string {
  if (typeof returnTo !== 'string') {
    return fallback;
  }

  const trimmed = returnTo.trim();

  if (!trimmed) {
    return fallback;
  }

  // Must be an app-relative path
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  // Reject protocol-relative URLs like //evil.com
  if (trimmed.startsWith('//')) {
    return fallback;
  }

  // Reject obvious attempts to pass a full URL
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
