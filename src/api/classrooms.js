import { api, requestKey } from './client';

// Retain the exact key for an ambiguous network/5xx failure, so a retry cannot
// create a second class, invitation, post or reply after a lost success response.
const pending = new Map();
export async function classroomWrite(path, method, body) {
  const signature = JSON.stringify([path, method, body]);
  const key = pending.get(signature) || requestKey();
  pending.set(signature, key);
  try {
    const result = await api(path, { method, body, key });
    pending.delete(signature);
    return result;
  } catch (error) {
    if (error.status >= 400 && error.status < 500) pending.delete(signature);
    throw error;
  }
}
