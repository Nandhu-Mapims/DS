import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { DischargeTemplate } from '../src/models/DischargeTemplate.js';
import { DischargeSummary } from '../src/models/DischargeSummary.js';
import { DEFAULT_TEMPLATES } from './defaultTemplates.js';
import { getBigCaseRecords, getSummaryTextForRecord, getAiEnhancedJsonForRecord, BIG_CASE_STATUSES } from './seedDummyData.js';
import { renderDischargeHtml } from '../src/ai/renderDischargeHtml.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/discharge-summary-db';

const SEED_USERS = [
  { email: 'admin@hospital.com', password: 'admin123', name: 'Admin', role: 'ADMIN' },
  { email: 'doctor@hospital.com', password: 'doctor123', name: 'Dr. Demo', role: 'DOCTOR' },
  { email: 'doctor2@hospital.com', password: 'doctor123', name: 'Dr. Suresh', role: 'DOCTOR' },
  { email: 'doctor3@hospital.com', password: 'doctor123', name: 'Dr. Priya', role: 'DOCTOR' },
  { email: 'chief@hospital.com', password: 'chief123', name: 'Chief Rajan', role: 'CHIEF' },
  { email: 'chief2@hospital.com', password: 'chief123', name: 'Chief Lakshmi', role: 'CHIEF' },
  { email: 'chief3@hospital.com', password: 'chief123', name: 'Chief Venkat', role: 'CHIEF' },
  { email: 'chief4@hospital.com', password: 'chief123', name: 'Chief Meena', role: 'CHIEF' },
  { email: 'chief5@hospital.com', password: 'chief123', name: 'Chief Arun', role: 'CHIEF' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1) Templates
  let templateIds = await DischargeTemplate.find().select('_id').lean().then((r) => r.map((t) => t._id));
  if (templateIds.length === 0) {
    const inserted = await DischargeTemplate.insertMany(DEFAULT_TEMPLATES);
    templateIds = inserted.map((t) => t._id);
    console.log('Inserted 3 default templates.');
  } else {
    console.log('Templates already exist, skipping.');
  }

  // 2) Users (1 admin, 3 doctors, 5 chiefs)
  const userIds = { admin: null, doctors: [], chiefs: [] };
  for (const u of SEED_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      if (existing.role === 'ADMIN') userIds.admin = existing._id;
      if (existing.role === 'DOCTOR') userIds.doctors.push(existing._id);
      if (existing.role === 'CHIEF') userIds.chiefs.push(existing._id);
      continue;
    }
    const user = await User.create(u);
    if (user.role === 'ADMIN') userIds.admin = user._id;
    if (user.role === 'DOCTOR') userIds.doctors.push(user._id);
    if (user.role === 'CHIEF') userIds.chiefs.push(user._id);
  }
  if (userIds.doctors.length === 0) {
    const doctors = await User.find({ role: 'DOCTOR' }).select('_id').lean();
    userIds.doctors = doctors.map((d) => d._id);
  }
  if (userIds.doctors.length === 0) {
    console.log('No doctors in DB. Creating at least one.');
    const dr = await User.create({ email: 'doctor@hospital.com', password: 'doctor123', name: 'Dr. Demo', role: 'DOCTOR' });
    userIds.doctors = [dr._id];
  }
  console.log('Users: 1 admin,', userIds.doctors.length, 'doctors,', userIds.chiefs.length, 'chiefs.');

  // 3) Remove all discharge summaries, then seed 10 big-case patients
  const deleted = await DischargeSummary.deleteMany({});
  console.log('Removed', deleted.deletedCount, 'existing discharge summaries.');

  const bigCaseRecords = getBigCaseRecords();
  const templateId = templateIds[0];
  const doctorIds = userIds.doctors;
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 14);

  for (let i = 0; i < bigCaseRecords.length; i++) {
    const rec = bigCaseRecords[i];
    const status = BIG_CASE_STATUSES[i];
    const createdBy = doctorIds[i % doctorIds.length];

    const doc = {
      ...rec,
      status,
      templateId,
      templateVersion: '1.0.0',
      createdBy,
    };

    const fullSummaryText = getSummaryTextForRecord(rec);
    if (status !== 'DRAFT' && status !== 'REJECTED') {
      doc.doctorDraftText = fullSummaryText;
      doc.aiEnhancedText = fullSummaryText;
      const aiEnhancedJson = getAiEnhancedJsonForRecord(rec);
      doc.aiEnhancedJson = aiEnhancedJson;
      doc.renderedHtml = renderDischargeHtml(aiEnhancedJson);
      doc.missingFields = [];
      doc.warnings = [];
      doc.aiMeta = { model: 'seed', promptVersion: '1', generatedAt: new Date(baseDate.getTime() + i * 86400000) };
    }
    if (status === 'PENDING_APPROVAL' || status === 'CHIEF_EDITED' || status === 'APPROVED') {
      doc.submittedAt = new Date(baseDate.getTime() + i * 86400000);
    }
    if (status === 'CHIEF_EDITED' || status === 'APPROVED') {
      doc.chiefEditedText = fullSummaryText;
      doc.chiefEditedAt = new Date(baseDate.getTime() + i * 86400000 + 3600000);
    }
    if (status === 'APPROVED') {
      doc.finalVerifiedText = fullSummaryText;
      doc.approvedAt = new Date(baseDate.getTime() + i * 86400000 + 7200000);
    }

    await DischargeSummary.create(doc);
  }
  const firstUhid = bigCaseRecords[0]?.uhid || '—';
  const lastUhid = bigCaseRecords[bigCaseRecords.length - 1]?.uhid || '—';
  console.log('Seeded', bigCaseRecords.length, 'big-case discharge summaries (' + firstUhid + '–' + lastUhid + ') with structured JSON and rendered HTML.');

  await mongoose.disconnect();
  console.log('Seed done.');
  console.log('Login: doctor@hospital.com / doctor123 | chief@hospital.com / chief123 | chief2@hospital.com ... chief5@hospital.com / chief123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
