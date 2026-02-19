/** Normalize status to lowercase for frontend (e.g. DRAFT -> draft) */
export function normalizeStatus(s) {
  if (s == null) return s;
  return String(s).toLowerCase();
}

export function dischargeToClient(doc) {
  if (!doc) return doc;
  const out = { ...doc };
  if (out.status) out.status = normalizeStatus(out.status);
  if (out._id) out._id = out._id.toString();
  return out;
}

export function listToClient(list) {
  return Array.isArray(list) ? list.map(dischargeToClient) : list;
}
