import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/models/User.js';
import { DischargeSummary } from '../src/models/DischargeSummary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/discharge-summary-db';

async function seedDetailedDraft() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the doctor user
        const doctor = await User.findOne({ email: 'doctor@hospital.com' });
        if (!doctor) {
            console.error('Doctor not found (doctor@hospital.com). Run main seed first.');
            process.exit(1);
        }

        const draftsToCreate = 12;
        console.log(`Creating ${draftsToCreate} empty DRAFT summaries...`);

        const tamilNames = [
            "Karthik Raja", "Lakshmi Narayanan", "Ramesh Kumar", "Meena Kumari",
            "Senthil Vel", "Priya Darshini", "Muthu Krishnan", "Anitha Devi",
            "Saravanan P", "Geetha Lakshmi", "Velu Murugan", "Revathi S"
        ];

        for (let i = 1; i <= draftsToCreate; i++) {
            const pad = (num) => String(num).padStart(4, '0');
            const hasImplant = i % 3 === 0; // Every 3rd patient has an implant

            const draftData = {
                uhid: `${pad(i)}`,
                ipid: `IP${pad(i)}`,
                mobile: `984001${pad(i)}`,
                status: 'DRAFT',

                // Basic Patient Details
                patientName: tamilNames[i - 1],
                age: `${40 + i} Years`,
                gender: i % 2 === 0 ? 'Female' : 'Male',
                address: `No ${i}, Gandhipuram, Coimbatore`,

                admissionDate: '2024-02-18',
                dischargeDate: '2024-02-22',
                department: 'General Medicine',
                consultant: 'Dr. V. Rao',
                wardBed: `Ward ${i}`,

                // --- MOCK MEDICAL DETAILS ---
                provisionalDiagnosis: 'Acute Gastroenteritis with Moderate Dehydration',
                finalDiagnosis: 'Acute Gastroenteritis (Viral etiology), Hyponatremia (Corrected), Type 2 Diabetes Mellitus',
                icd10Codes: ['A09', 'E11.9', 'E87.1'],

                reasonForAdmission: 'Patient presented with complaints of multiple episodes of loose stools (watery, non-bloody) and vomiting for 2 days. Associated with generalized weakness, giddy sensation, and decreased oral intake. No history of fever or abdominal pain.',

                clinicalExamination: 'On admission, patient was conscious but lethargic. Vitals: BP 100/70 mmHg, PR 102/min (tachycardia), RR 20/min, Temp 98.6F, SpO2 96% on room air. Signs of dehydration present (dry tongue, reduced skin turgor). Systemic Exam: CVS - S1S2 heard, no murmurs. RS - NVBS, clear. P/A - Soft, diffusely tender, no organomegaly, bowel sounds increased. CNS - NFND.',

                significantFindings: 'Random Blood Sugar: 240 mg/dL. Creatinine: 1.1 mg/dL (borderline). Na+: 130 mEq/L (Mild Hyponatremia). K+: 3.8 mEq/L.',

                courseInHospital: 'Patient was admitted and started on IV fluids (RL and NS) for rehydration. Anti-emetics (Inj. Ondansetron) and probiotics were administered. Oral hypoglycemic agents were continued. Electrolytes were monitored; sodium levels improved to 136 mEq/L after correction. By Day 3, frequency of stools reduced and vomiting resolved. Patient tolerated soft diet. Vitals normalized. Mobilized and stable at discharge.',

                investigations: '', // Intentionally blank for testing

                // Structured Lab Results
                labResults: [
                    { investigation: 'Hemoglobin', resultAdmission: '11.2 g/dL', resultDischarge: '11.5 g/dL', referenceRange: '12-16' },
                    { investigation: 'WBC', resultAdmission: '9500 /uL', resultDischarge: '8200 /uL', referenceRange: '4000-11000' },
                    { investigation: 'Platelets', resultAdmission: '2.1L /uL', resultDischarge: '-', referenceRange: '1.5-4.5L' },
                    { investigation: 'Serum Sodium', resultAdmission: '130 mEq/L', resultDischarge: '136 mEq/L', referenceRange: '135-145' }
                ],

                // Structured Procedures
                procedureList: [
                    { date: '2024-02-19', name: 'IV Cannulation', indicationOutcome: 'For fluid resuscitation' },
                    { date: '2024-02-20', name: 'Blood Culture', indicationOutcome: 'No growth after 48h' }
                ],

                imagingReports: 'USG Abdomen: Mild hepatomegaly with fatty changes. Normal gallbladder and pancreas.\nChest X-Ray: Clear lung fields. Normal cardiac size.',

                treatment: 'IV Fluids (3L total over 24h), Inj. Ondansetron 4mg TDS, Cap. Vizylac BD, Tab. Metformin 500mg BD (continued)',

                medications: '', // Intentionally left blank to test if AI picks from treatment

                // Structured medication list for testing table generation
                medicationList: [
                    { name: 'Tab. Metformin', dosage: '500mg', frequency: '1-0-1', duration: 'Continue', instructions: 'After food' },
                    { name: 'Tab. Pan 40', dosage: '40mg', frequency: '1-0-0', duration: '5 days', instructions: 'Before food' },
                    { name: 'Sachet. ORS', dosage: '-', frequency: 'As needed', duration: '3 days', instructions: 'Dissolve in 1L water' }
                ],

                // Add medical device as requested
                deviceList: hasImplant ? [
                    { deviceType: 'Drug Eluting Stent (DES)', model: 'Xience Prime', location: 'LAD', implantDate: '2023-05-10' }
                ] : [],

                advice: 'Drink plenty of boiled and cooled water. Avoid spicy and oily foods. Review if symptoms recur.',
                followUp: 'Review in OPD after 1 week.',
                redFlags: 'Persistent vomiting, high grade fever, blood in stools, severe abdominal pain.',
                dischargeCondition: 'Stable. Afebrile. Tolerating oral soft diet.',

                createdBy: doctor._id
            };

            const createdDraft = await DischargeSummary.create(draftData);
            console.log(`  - Created ${createdDraft.uhid} (${createdDraft.patientName})`);
        }

        console.log('\nSuccessfully created 12 DETAILED test drafts!');
        console.log('Please refresh your doctor dashboard to see these drafts.');
        console.log('---------------------------------------------------');
        console.log('CREDENTIALS:');
        console.log('Doctor Login: doctor@hospital.com / doctor123');
        console.log('Chief Login:  chief@hospital.com  / chief123');
        console.log('---------------------------------------------------');

    } catch (error) {
        console.error('Error seeding draft:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedDetailedDraft();
