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

async function seedDraft() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the doctor user
        const doctor = await User.findOne({ email: 'doctor@hospital.com' });
        if (!doctor) {
            console.error('Doctor user (doctor@hospital.com) not found. Please run "npm run seed" first.');
            process.exit(1);
        }

        const draftData = {
            uhid: 'UH-TEST-AI',
            ipid: 'IP-TEST-AI',
            mobile: '9876543210',
            status: 'DRAFT',

            patientName: 'Ramesh Kumar',
            age: '55 Years',
            gender: 'Male',
            address: '123, Gandhi Road, Chennai',

            admissionDate: '2024-02-10',
            dischargeDate: '2024-02-15',
            department: 'Cardiology',
            consultant: 'Dr. P. Arumugam',
            wardBed: 'ICU-10',

            provisionalDiagnosis: 'Acute Chest Pain',
            finalDiagnosis: 'Unstable Angina',
            icd10Codes: ['I20.0'],

            courseInHospital: 'Patient admitted with complaints of chest pain. ECG showed T-wave inversion. Troponin was negative. Managed conservatively with antiplatelets, statins, and beta-blockers. Patient is stable at discharge.',

            investigations: 'Hb: 12.5, WBC: 8000, Platelets: 2.5L, Creatinine: 0.9. ECG: T-wave inversion in V1-V4.',
            treatment: 'Tab. Aspirin 75mg OD, Tab. Clopidogrel 75mg OD, Tab. Atorvastatin 40mg HS',

            createdBy: doctor._id
        };

        const createdDraft = await DischargeSummary.create(draftData);
        console.log('Successfully created test draft!');
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

seedDraft();
