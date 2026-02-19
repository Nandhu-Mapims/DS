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

        const draftData = {
            uhid: 'UH-COMPLEX-01',
            ipid: 'IP-COMPLEX-01',
            mobile: '9840012345',
            status: 'DRAFT',

            patientName: 'Saraswathi Ammal',
            age: '65 Years',
            gender: 'Female',
            address: 'No 45, 2nd Cross Street, Anna Nagar, Madurai',

            admissionDate: '2024-02-18',
            dischargeDate: '2024-02-22',
            department: 'General Medicine',
            consultant: 'Dr. V. Rao',
            wardBed: 'Female Ward - 12',

            provisionalDiagnosis: 'Acute Gastroenteritis with Moderate Dehydration',
            finalDiagnosis: 'Acute Gastroenteritis (Viral etiology), Hyponatremia (Corrected), Type 2 Diabetes Mellitus',
            icd10Codes: ['A09', 'E11.9', 'E87.1'],

            reasonForAdmission: 'Mrs. Saraswathi Ammal, a 65-year-old female, known diabetic, presented with complaints of multiple episodes of loose stools (watery, non-bloody) and vomiting for 2 days. Associated with generalized weakness, giddy sensation, and decreased oral intake. No history of fever or abdominal pain.',

            clinicalExamination: 'On admission, patient was conscious but lethargic. Vitals: BP 100/70 mmHg, PR 102/min (tachycardia), RR 20/min, Temp 98.6F, SpO2 96% on room air. Signs of dehydration present (dry tongue, reduced skin turgor). Systemic Exam: CVS - S1S2 heard, no murmurs. RS - NVBS, clear. P/A - Soft, diffsuley tender, no organomegaly, bowel sounds increased. CNS - NFND.',

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
            deviceList: [
                { deviceType: 'Drug Eluting Stent (DES)', model: 'Xience Prime', location: 'LAD', implantDate: '2023-05-10' }
            ],

            advice: 'Drink plenty of boiled and cooled water. Avoid spicy and oily foods. Review if symptoms recur.',
            followUp: 'Review in OPD after 1 week (29-02-2024).',
            redFlags: 'Persistent vomiting, high grade fever, blood in stools, severe abdominal pain.',
            dischargeCondition: 'Stable. Afebrile. Tolerating oral soft diet.',

            createdBy: doctor._id
        };

        const createdDraft = await DischargeSummary.create(draftData);
        console.log('Successfully created DETAILED test draft!');
        console.log('UHID:', createdDraft.uhid);
        console.log('ID:', createdDraft._id);
        console.log('Please refresh your doctor dashboard to see this draft.');

    } catch (error) {
        console.error('Error seeding draft:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedDetailedDraft();
