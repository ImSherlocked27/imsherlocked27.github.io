export function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin
  }

  return headers
}
