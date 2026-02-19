import mongoose from 'mongoose';

const LAYOUTS = ['CLASSIC', 'MODERN', 'COMPACT', 'PREMIUM_TABLE'];
const SECTION_DISPLAY = ['paragraph', 'table', 'flow'];

const sectionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
  display: { type: String, enum: SECTION_DISPLAY, default: 'paragraph' },
  flow: { type: String, default: 'label_value' }, // 'label_value' | 'single_column' (for table: rows as label|value or single column)
}, { _id: false });

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    version: { type: String, required: true, default: '1.0.0' },
    isActive: { type: Boolean, default: true },
    sections: { type: [sectionSchema], default: [] },
    layout: { type: String, enum: LAYOUTS, default: 'CLASSIC' },
    defaultCss: { type: String, default: '' },
    createdBy: { type: String, enum: ['ADMIN'], default: 'ADMIN' },
  },
  { timestamps: true }
);

export const DischargeTemplate = mongoose.model('DischargeTemplate', templateSchema);
export { LAYOUTS as TEMPLATE_LAYOUTS, SECTION_DISPLAY as TEMPLATE_SECTION_DISPLAY };
