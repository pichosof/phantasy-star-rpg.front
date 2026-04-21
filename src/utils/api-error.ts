/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Extracts a human-readable error message from an Axios/API error.
 *
 * Fastify error shape:
 *   { statusCode, code, error: "Bad Request", message: "body/field must ..." }
 *
 * Strategy:
 *   1. Use `data.message` — the detailed Fastify/validation message.
 *   2. Strip JSON-Schema path prefixes (body/field → field, params/id → id).
 *   3. For anyOf validation noise, drop the "must be null" and
 *      "must match a schema" fragments — they describe the schema structure,
 *      not the user mistake.
 *   4. Fall back to `data.error` ("Bad Request"), then to the JS error message,
 *      then to the provided fallback string.
 */
export function apiErrorMessage(err: unknown, fallback = 'An error occurred.'): string {
  if (!err || typeof err !== 'object') return fallback;

  const data: Record<string, unknown> | undefined = (err as any)?.response?.data;

  if (!data) return (err as any)?.message ?? fallback;

  const raw = typeof data['message'] === 'string' ? data['message'] : '';
  const label = typeof data['error'] === 'string' ? data['error'] : '';

  if (!raw) return label || fallback;

  const cleaned = raw
    // Strip JSON-Schema path prefixes: body/field → field, params/id → id
    .replace(/(?:body|params|query|headers)\/([^\s,]+)/g, '$1')
    // Split anyOf fragments and drop the ones that describe the schema, not the mistake
    .split(', ')
    .filter((s) => !s.includes('must be null') && !s.includes('must match a schema in anyOf') && s.trim().length > 0)
    .join('; ')
    .trim();

  return cleaned || label || fallback;
}

/**
 * Returns `{ message, description? }` ready to spread into notificationController.error().
 * If there is both a label and a detail, the label becomes the title and the
 * detail becomes the description so the user sees the full context.
 */
export function apiErrorNotification(
  err: unknown,
  fallback = 'An error occurred.',
): { message: string; description?: string } {
  if (!err || typeof err !== 'object') return { message: fallback };

  const data: Record<string, unknown> | undefined = (err as any)?.response?.data;
  if (!data) return { message: (err as any)?.message ?? fallback };

  const label = typeof data['error'] === 'string' ? data['error'] : '';
  const detail = apiErrorMessage(err, '');

  if (label && detail && detail !== label) {
    return { message: label, description: detail };
  }

  return { message: detail || label || fallback };
}
