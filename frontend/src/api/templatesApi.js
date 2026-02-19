import { api } from './axios';

/**
 * List active templates (for doctor/chief template picker)
 */
export async function listTemplates(activeOnly = true) {
  const res = await api.get('/templates', { params: activeOnly ? {} : { active: 'false' } });
  return res.data?.data !== undefined ? res.data.data : res.data;
}

/**
 * Get template by id
 */
export async function getTemplate(id) {
  const res = await api.get(`/templates/${id}`);
  return res.data?.data !== undefined ? res.data.data : res.data;
}
