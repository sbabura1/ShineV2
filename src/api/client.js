import { fetchAuthSession } from 'aws-amplify/auth';

export class ApiError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

export const requestKey = () => crypto.randomUUID();

export async function api(path, { method = 'GET', body, key, signal } = {}) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!base) throw new ApiError('The service connection is not configured.', 0, 'API_NOT_CONFIGURED');
  const send = async (refresh = false) => {
    const session = await fetchAuthSession({ forceRefresh: refresh });
    const token = session.tokens?.accessToken?.toString();
    if (!token) throw new ApiError('Your session has expired. Please sign in again.', 401, 'SESSION_EXPIRED');
    return fetch(`${base}${path}`, { method, signal,
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(key ? { 'Idempotency-Key': key } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  };
  let response;
  try {
    response = await send();
    if (response.status === 401) response = await send(true);
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof ApiError) throw error;
    throw new ApiError('Unable to connect. Check your connection and try again.', 0, 'CONNECTION_FAILED');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error?.message || data.message || 'The request could not be completed.', response.status, data.error?.code);
  return data;
}

export const segment = value => encodeURIComponent(value);
