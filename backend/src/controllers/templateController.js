import { DischargeTemplate } from '../models/DischargeTemplate.js';
import { success, error } from '../utils/response.js';

export async function list(req, res) {
  const activeOnly = req.query.active !== 'false';
  const filter = activeOnly ? { isActive: true } : {};
  const list = await DischargeTemplate.find(filter).sort({ name: 1 }).lean();
  return success(res, list);
}

export async function getById(req, res) {
  const template = await DischargeTemplate.findById(req.params.id).lean();
  if (!template) return error(res, 'Template not found', 404);
  return success(res, template);
}

export async function create(req, res) {
  const { name, description, version, sections, layout, defaultCss } = req.body;
  const template = await DischargeTemplate.create({
    name: name || 'Unnamed Template',
    description: description || '',
    version: version || '1.0.0',
    isActive: true,
    sections: sections || [],
    layout: layout || 'CLASSIC',
    defaultCss: defaultCss || '',
  });
  return success(res, template, 'Template created', 201);
}

export async function update(req, res) {
  const { name, description, version, sections, layout, defaultCss } = req.body;
  const template = await DischargeTemplate.findByIdAndUpdate(
    req.params.id,
    {
      ...(name != null && { name }),
      ...(description != null && { description }),
      ...(version != null && { version }),
      ...(sections != null && { sections }),
      ...(layout != null && { layout }),
      ...(defaultCss != null && { defaultCss }),
    },
    { new: true, runValidators: true }
  );
  if (!template) return error(res, 'Template not found', 404);
  return success(res, template, 'Template updated');
}

export async function toggle(req, res) {
  const template = await DischargeTemplate.findById(req.params.id);
  if (!template) return error(res, 'Template not found', 404);
  template.isActive = !template.isActive;
  await template.save();
  return success(res, template, template.isActive ? 'Template activated' : 'Template deactivated');
}
