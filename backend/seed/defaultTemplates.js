/**
 * Premium discharge templates with table-based sections and defined flows.
 * Flow = section order and how each section is displayed (paragraph vs table).
 */

const SECTION_FLOW = [
  { key: 'header', label: 'Header', order: 0, display: 'paragraph', flow: 'single_column' },
  { key: 'patient_identifiers', label: 'Patient Identifiers', order: 1, display: 'table', flow: 'label_value' },
  { key: 'admission_discharge', label: 'Admission / Discharge', order: 2, display: 'table', flow: 'label_value' },
  { key: 'diagnosis', label: 'Diagnosis', order: 3, display: 'table', flow: 'label_value' },
  { key: 'course', label: 'Course in Hospital', order: 4, display: 'paragraph', flow: 'label_value' },
  { key: 'investigations', label: 'Investigations', order: 5, display: 'paragraph', flow: 'label_value' },
  { key: 'treatment', label: 'Treatment', order: 6, display: 'paragraph', flow: 'label_value' },
  { key: 'procedures', label: 'Procedures', order: 7, display: 'paragraph', flow: 'label_value' },
  { key: 'discharge_condition', label: 'Discharge Condition', order: 8, display: 'paragraph', flow: 'label_value' },
  { key: 'medications', label: 'Medications', order: 9, display: 'paragraph', flow: 'label_value' },
  { key: 'advice', label: 'Advice', order: 10, display: 'paragraph', flow: 'label_value' },
  { key: 'follow_up', label: 'Follow-up', order: 11, display: 'paragraph', flow: 'label_value' },
  { key: 'red_flags', label: 'Red Flags', order: 12, display: 'paragraph', flow: 'label_value' },
  { key: 'signatures', label: 'Signatures', order: 13, display: 'table', flow: 'label_value' },
];

export const DEFAULT_SECTIONS = SECTION_FLOW;

const PREMIUM_TABLE_CSS = `
  body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 1.5rem; color: #1a1a1a; }
  .template-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; border-bottom: 2px solid #333; padding-bottom: 0.5rem; }
  section { margin-bottom: 1.25rem; }
  section h3 { font-size: 0.95rem; margin: 0 0 0.5rem 0; color: #333; }
  .section-body { font-size: 0.9rem; line-height: 1.5; }
  table.ds-table { width: 100%; border-collapse: collapse; margin: 0.25rem 0; font-size: 0.9rem; }
  table.ds-table th, table.ds-table td { border: 1px solid #ddd; padding: 0.4rem 0.6rem; text-align: left; }
  table.ds-table th { background: #f5f5f5; font-weight: 600; width: 28%; }
  table.ds-table tr:nth-child(even) { background: #fafafa; }
`;

export const DEFAULT_TEMPLATES = [
  {
    name: 'Premium NABH Template A',
    description: 'Premium layout with tables and clear section flow. Patient identifiers and key blocks in tables.',
    version: '1.0.0',
    isActive: true,
    sections: SECTION_FLOW,
    layout: 'PREMIUM_TABLE',
    defaultCss: PREMIUM_TABLE_CSS,
  },
  {
    name: 'Premium NABH Template B',
    description: 'Premium flow with tables for identifiers and diagnosis; paragraph blocks for course and advice.',
    version: '1.0.0',
    isActive: true,
    sections: SECTION_FLOW,
    layout: 'PREMIUM_TABLE',
    defaultCss: PREMIUM_TABLE_CSS,
  },
  {
    name: 'Premium NABH Template C',
    description: 'Compact premium tables and flows for NABH-compliant discharge summary.',
    version: '1.0.0',
    isActive: true,
    sections: SECTION_FLOW,
    layout: 'PREMIUM_TABLE',
    defaultCss: PREMIUM_TABLE_CSS + ' body { font-size: 12px; } table.ds-table th, table.ds-table td { padding: 0.3rem 0.5rem; }',
  },
];
