import { api } from './axios';

/** Unwrap backend response { success, data } */
function unwrap(res) {
  return res.data?.data !== undefined ? res.data.data : res.data;
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return unwrap(res);
}

export async function register(email, password, name, role) {
  const res = await api.post('/auth/register', { email, password, name, role });
  return unwrap(res);
}
