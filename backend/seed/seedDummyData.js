/**
 * Dummy patient and discharge summary data for seeding.
 * Generates full structured summary text (## sections, ---, markdown tables) for each record.
 */

const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Suresh', 'Lakshmi', 'Kumar', 'Anitha', 'Murugan', 'Meena',
  'Venkat', 'Selvi', 'Arun', 'Kavitha', 'Mani', 'Deepa', 'Ravi', 'Padmini',
  'Senthil', 'Revathi', 'Gopal', 'Vasantha', 'Balaji', 'Shanthi', 'Karthik', 'Geetha',
  'Vijay', 'Malini', 'Naveen', 'Usha', 'Prakash', 'Latha', 'Dinesh', 'Prema',
  'Srinivas', 'Janaki', 'Mohammed', 'Radhika', 'Ashok', 'Chitra', 'Harish', 'Sumathi',
];

const LAST_NAMES = [
  'Kumar', 'Devi', 'Pillai', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Sharma',
  'Patel', 'Singh', 'Raj', 'Lal', 'Verma', 'Gupta', 'Khan', 'Rao',
  'Pillai', 'Nambiar', 'Krishnan', 'Subramanian', 'Gowda', 'Shetty', 'Bose', 'Mukherjee',
];

const DEPARTMENTS = ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Surgery', 'Neurology', 'Pulmonology', 'Gastroenterology', 'Endocrinology', 'Nephrology'];

/** Sample addresses for seeded patients (one per big-case record). */
const BIG_CASE_ADDRESSES = [
  'No 45, Gandhi Road, Melmaruvathur, Tamil Nadu 603319',
  '12/4 Anna Nagar, Chennai, Tamil Nadu 600040',
  'Plot 7, SIPCOT Industrial Area, Sriperumbudur, TN 602105',
  'Door No 23, North Street, Madurai, Tamil Nadu 625001',
  'Flat 4B, Lakshmi Towers, T Nagar, Chennai 600017',
  'No 8, Railway Station Road, Coimbatore, Tamil Nadu 641001',
  '15 Second Street, Rameshwaram, Ramanathapuram, TN 623526',
  '34 MG Road, Trichy, Tamil Nadu 620001',
  '2/1 Temple Street, Thanjavur, Tamil Nadu 613001',
  'Block C, Apollo Apartments, Velachery, Chennai 600042',
  'No 56, Hospital Road, Salem, Tamil Nadu 636001',
  '7 Park View, Ooty, Nilgiris, Tamil Nadu 643001',
  '19 Beach Road, Mahabalipuram, Kancheepuram, TN 603104',
  'Flat 12, Sowarpet, Chennai 600079',
  'No 3, Agraharam Street, Kumbakonam, TN 612001',
  '22 Bypass Road, Erode, Tamil Nadu 638001',
  '5 Doctors Colony, Anna Nagar West, Chennai 600040',
  '11 South Car Street, Tirunelveli, Tamil Nadu 627006',
  'Plot 9, Industrial Estate, Ranipet, Vellore, TN 632403',
  'No 41, NH Road, Villupuram, Tamil Nadu 605602',
];

/** Consultant name by department for seeded summaries. */
const CONSULTANT_BY_DEPARTMENT = {
  'General Medicine': 'Dr. R. Suresh, MD (General Medicine)',
  'Cardiology': 'Dr. P. Arumugam, MD, DM (Cardiology)',
  'Orthopedics': 'Dr. K. Venkatesh, MS (Orthopedics)',
  'Pediatrics': 'Dr. M. Geetha, MD (Pediatrics)',
  'Surgery': 'Dr. S. Balakrishnan, MS (General Surgery)',
  'Neurology': 'Dr. N. Nambiar, DM (Neurology)',
  'Pulmonology': 'Dr. A. Rajan, MD (Pulmonology)',
  'Gastroenterology': 'Dr. L. Iyer, DM (Gastroenterology)',
  'Endocrinology': 'Dr. V. Lakshmi, MD (Endocrinology)',
  'Nephrology': 'Dr. T. Subramanian, DM (Nephrology)',
  'Cardiothoracic Surgery': 'Dr. R. Karthik, MCh (Cardiothoracic Surgery)',
  'Vascular Surgery': 'Dr. P. Gopal, MCh (Vascular Surgery)',
  'Critical Care': 'Dr. S. Meena, MD (Critical Care)',
};

/** Clinical examination findings by department for seeded summaries. */
const CLINICAL_EXAM_BY_DEPT = {
  'Cardiology': 'On admission, the patient was tachypneic with a RR of 26/min. Pulse was 112/min, feeble but regular. BP was 160/90 mmHg. Cardiovascular examination revealed a prominent S3 gallop. Respiratory examination showed bilateral basal fine inspiratory rales. Pitting pedal edema was present up to the mid-calf level.',
  'Neurology': 'On admission, the patient was conscious but drowsy. GCS 13/15 (E3V4M6). Right-sided hemiparesis with power 2/5 in upper and lower limbs. BP 170/100 mmHg. Pupils bilaterally equal and reactive. Babinski sign positive on the right. Speech slurred.',
  'General Medicine': 'On admission, the patient was febrile (Temp 39.2°C), tachycardic (PR 118/min), and hypoxic (SpO2 88% on room air). RR 28/min, BP 100/60 mmHg. Respiratory examination: bilateral crepitations in lower zones. Abdomen soft, non-tender.',
  'Orthopedics': 'On admission, there was tenderness and swelling over the right hip, with shortening and external rotation of the right lower limb. Unable to bear weight. Neurovascular status of the limb was intact distally. Vitals: PR 92/min, BP 148/86 mmHg, afebrile.',
  'Pulmonology': 'On admission, the patient was tachypneic (RR 32/min), using accessory muscles of respiration. SpO2 78% on room air. BP 140/85 mmHg. Barrel-shaped chest. Bilateral rhonchi with prolonged expiration. Air entry diminished bilaterally.',
  'Endocrinology': 'On admission, the patient had a left heel ulcer (3 × 4 cm) with surrounding cellulitis and foul-smelling discharge. Temperature 38.6°C. PR 96/min, BP 142/88 mmHg. Peripheral pulses: dorsalis pedis feeble on left. Reduced sensation in both feet (glove and stocking pattern).',
  'Gastroenterology': 'On admission, the patient appeared pale and dehydrated. PR 108/min, BP 90/60 mmHg. Abdomen was soft with epigastric tenderness. No guarding or rigidity. Bowel sounds present. Per-rectal examination showed melaena on glove.',
  'Nephrology': 'On admission, the patient had bilateral pitting pedal edema up to the knees. BP 168/98 mmHg. PR 88/min. JVP raised. Respiratory examination: bilateral basal crepitations. Abdomen: no ascites. Urine output reduced to 300 mL/24 h.',
  'Surgery': 'On admission, the patient was in severe distress. PR 120/min, BP 100/60 mmHg. Abdomen: board-like rigidity, generalised tenderness, absent bowel sounds. Guarding present. Free fluid clinically detectable. Per-rectal examination unremarkable.',
  'Pediatrics': 'On admission, the child was febrile (Temp 39.8°C), flushed with a petechial rash on the trunk. HR 126/min, RR 22/min, BP 90/60 mmHg. Capillary refill time 3 seconds. Hepatomegaly 2 cm below costal margin. Mild dehydration.',
  'Cardiothoracic Surgery': 'On admission, the patient was in severe distress with tearing chest pain. PR 110/min, BP 190/110 mmHg (right arm), 160/90 mmHg (left arm). Early diastolic murmur at aortic area. No neurological deficit. Peripheral pulses asymmetric.',
  'Vascular Surgery': 'On admission, the right lower limb was cold, pale, and pulseless below the knee. Dorsalis pedis and posterior tibial pulses absent on the right. Capillary refill time > 4 seconds. Motor and sensory function partially preserved. Left leg normal.',
  'Critical Care': 'On admission, the patient was in severe respiratory distress. SpO2 62% on 15 L oxygen via non-rebreather mask. RR 38/min, PR 128/min, BP 100/70 mmHg. Bilateral diffuse crepitations. GCS 14/15 (E3V5M6). Cyanosis present.',
};

/** Ward/Bed for each big-case record (ICU, ICCU, ward, etc.). */
const BIG_CASE_WARD_BEDS = [
  'ICCU / Bed 3',
  'Stroke Unit / Bed 8',
  'ICU / Bed 2',
  'Ward 4 / Bed 12',
  'Respiratory ICU / Bed 1',
  'Ward 2 / Bed 15',
  'Ward 3 / Bed 7',
  'Ward 1 / Bed 22',
  'Surgical ICU / Bed 4',
  'Pediatric Ward / Bed 6',
  'CCU / Bed 201',
  'Ward 5 / Bed 10',
  'Neurology ICU / Bed 2',
  'Ward 2 / Bed 18',
  'Hepatology Ward / Bed 5',
  'Surgical Ward / Bed 14',
  'CTVS ICU / Bed 1',
  'Vascular Ward / Bed 3',
  'Gastro Ward / Bed 9',
  'Critical Care Unit / Bed 6',
];

const DIAGNOSIS_OPTIONS = [
  { provisional: 'Hypertension', final: 'Essential hypertension (I10)', icd: ['I10'] },
  { provisional: 'Type 2 DM', final: 'Type 2 diabetes mellitus without complications (E11.9)', icd: ['E11.9'] },
  { provisional: 'COPD', final: 'Chronic obstructive pulmonary disease (J44.9)', icd: ['J44.9'] },
  { provisional: 'CAD', final: 'Coronary artery disease (I25.10)', icd: ['I25.10'] },
  { provisional: 'UTI', final: 'Urinary tract infection (N39.0)', icd: ['N39.0'] },
  { provisional: 'Pneumonia', final: 'Community-acquired pneumonia (J18.9)', icd: ['J18.9'] },
  { provisional: 'Fracture femur', final: 'Fracture of shaft of femur (S72.30)', icd: ['S72.30'] },
  { provisional: 'Acute gastritis', final: 'Acute gastritis (K29.0)', icd: ['K29.0'] },
  { provisional: 'CKD', final: 'Chronic kidney disease, stage 3a (N18.31)', icd: ['N18.31'] },
  { provisional: 'Hypothyroidism', final: 'Hypothyroidism, unspecified (E03.9)', icd: ['E03.9'] },
  { provisional: 'AF', final: 'Atrial fibrillation (I48.19)', icd: ['I48.19'] },
  { provisional: 'Asthma', final: 'Mild persistent asthma (J45.30)', icd: ['J45.30'] },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().slice(0, 10);
}

function padNum(n, len = 4) {
  return String(n).padStart(len, '0');
}

/** Generate dummy patient/discharge records. startIndex offsets UHID/IPID to avoid duplicates when adding to existing seed. */
export function generateDummyDischarges(count = 24, startIndex = 0) {
  const records = [];
  const usedUhids = new Set();

  for (let i = 1; i <= count; i++) {
    const n = startIndex + i;
    let uhid;
    do {
      uhid = 'UH' + padNum(1000 + n);
    } while (usedUhids.has(uhid));
    usedUhids.add(uhid);

    const ipid = 'IP' + padNum(2000 + n);
    const mobile = '9' + padNum(Math.floor(100000000 + Math.random() * 899999999), 9);
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const patientName = `${firstName} ${lastName}`;
    const age = String(22 + Math.floor(Math.random() * 55));
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    const department = randomItem(DEPARTMENTS);
    const diag = randomItem(DIAGNOSIS_OPTIONS);
    const admissionDate = randomDate(60);
    const dischargeDate = randomDate(14);

    const courseInHospital = `Patient was admitted with ${diag.provisional}. Clinical examination and investigations were carried out. Patient was started on appropriate treatment and monitored. Vital signs remained stable throughout the stay. Patient responded well to therapy and was deemed fit for discharge.`;
    const investigations = 'CBC, RFT, LFT, serum electrolytes, ECG, X-ray chest PA view, USG abdomen as indicated. Urine routine and culture when applicable.';
    const treatment = 'IV fluids, antibiotics/antihypertensives/antidiabetics as per unit protocol. Supportive care and symptom management.';
    const procedures = Math.random() > 0.6 ? 'IV cannulation, blood sampling for investigations.' : 'Nil.';
    const dischargeCondition = 'Stable, ambulant, afebrile. Vital signs within normal limits at discharge.';
    const medications = 'Tab. Amlodipine 5 mg OD, Tab. Metformin 500 mg BD. Continue other home medications as advised.';
    const advice = 'Low salt diet. Regular physical activity. Compliance with medications.';
    const followUp = `${department} OPD in 7 days with recent reports. Earlier if any worsening of symptoms.`;
    const redFlags = 'Report immediately if chest pain, severe breathlessness, high fever, or altered sensorium.';

    const address = randomItem(BIG_CASE_ADDRESSES);
    const consultant = CONSULTANT_BY_DEPARTMENT[department] || 'Dr. Consultant, MD';
    const wardBed = `${randomItem(['Ward 1', 'Ward 2', 'Ward 3', 'ICU', 'General Ward'])} / Bed ${Math.floor(Math.random() * 24) + 1}`;

    records.push({
      uhid,
      ipid,
      mobile,
      patientName,
      age,
      gender,
      address,
      department,
      consultant,
      wardBed,
      admissionDate,
      dischargeDate,
      provisionalDiagnosis: diag.provisional,
      finalDiagnosis: diag.final,
      icd10Codes: diag.icd,
      courseInHospital,
      investigations,
      treatment,
      procedures,
      dischargeCondition,
      medications,
      advice,
      followUp,
      redFlags,
    });
  }

  return records;
}

/**
 * Generate full discharge summary draft text (plain clinical text) for a record.
 * This is the doctor's draft that gets sent to the AI for JSON structuring.
 */
export function getSummaryTextForRecord(rec) {
  const sections = [];

  sections.push([
    'Patient Details:',
    `UHID: ${rec.uhid || ''}`,
    `IPID: ${rec.ipid || ''}`,
    `Name: ${rec.patientName || ''}`,
    `Mobile: ${rec.mobile || ''}`,
    `Age: ${rec.age || ''}`,
    `Gender: ${rec.gender || ''}`,
    rec.address ? `Address: ${rec.address}` : null,
  ].filter(Boolean).join('\n'));

  sections.push([
    'Admission & Discharge:',
    `Admission Date: ${rec.admissionDate || ''}`,
    `Discharge Date: ${rec.dischargeDate || ''}`,
    `Department: ${rec.department || ''}`,
    rec.consultant ? `Consultant: ${rec.consultant}` : null,
    rec.wardBed ? `Ward/Bed: ${rec.wardBed}` : null,
  ].filter(Boolean).join('\n'));

  sections.push([
    'Diagnosis:',
    `Provisional Diagnosis: ${rec.provisionalDiagnosis || ''}`,
    `Final Diagnosis: ${rec.finalDiagnosis || ''}`,
    `ICD-10 Codes: ${Array.isArray(rec.icd10Codes) ? rec.icd10Codes.join(', ') : (rec.icd10Codes || '')}`,
  ].join('\n'));

  if (rec.reasonForAdmission) {
    sections.push(`Reason for Admission:\n${rec.reasonForAdmission}`);
  }
  if (rec.clinicalExamination) {
    sections.push(`Clinical Examination:\n${rec.clinicalExamination}`);
  }
  if (rec.courseInHospital) {
    sections.push(`Course in Hospital:\n${rec.courseInHospital}`);
  }
  if (rec.investigations) {
    sections.push(`Investigations:\n${rec.investigations}`);
  }
  if (rec.treatment) {
    sections.push(`Treatment:\n${rec.treatment}`);
  }
  if (rec.procedures) {
    sections.push(`Procedures:\n${rec.procedures}`);
  }
  if (rec.dischargeCondition) {
    sections.push(`Discharge Condition:\n${rec.dischargeCondition}`);
  }
  if (rec.medications) {
    sections.push(`Medications:\n${rec.medications}`);
  }
  if (rec.advice) {
    sections.push(`Advice:\n${rec.advice}`);
  }
  if (rec.followUp) {
    sections.push(`Follow-up:\n${rec.followUp}`);
  }
  if (rec.redFlags) {
    sections.push(`Red Flags:\n${rec.redFlags}`);
  }

  return sections.join('\n\n');
}

/**
 * Ten predefined "big case" patient records with detailed clinical content.
 * Used when seeding after clearing the discharge collection.
 * Each record is enriched with address, consultant, and wardBed for template alignment.
 */
export function getBigCaseRecords() {
  const raw = [
    {
      uhid: 'UH2001',
      ipid: 'IP3001',
      mobile: '9876543210',
      patientName: 'Rajesh Kumar',
      age: '58',
      gender: 'Male',
      department: 'Cardiology',
      admissionDate: '2026-01-28',
      dischargeDate: '2026-02-05',
      provisionalDiagnosis: 'Acute coronary syndrome',
      finalDiagnosis: 'ST-elevation myocardial infarction (STEMI), post primary PCI (I21.3)',
      icd10Codes: ['I21.3', 'I25.10'],
      courseInHospital: 'Patient presented with severe retrosternal chest pain and breathlessness. ECG showed ST elevation in V1–V4. Emergency coronary angiography revealed critical LAD lesion; primary PCI with drug-eluting stent was performed. Post-procedure monitored in ICCU for 48 hours. Echo showed anterior wall hypokinesia with LVEF 40%. Started on dual antiplatelets, statin, ACE-i, beta-blocker. No recurrent chest pain or arrhythmia. Mobilised gradually and discharged on day 8.',
      investigations: 'Troponin I (serial), CK-MB, ECG, 2D Echo, coronary angiography, CBC, RFT, LFT, lipid profile, HbA1c.',
      treatment: 'Dual antiplatelet therapy (Aspirin + Clopidogrel), Atorvastatin 40 mg, Ramipril 2.5 mg OD, Metoprolol 25 mg BD, IV nitrates and heparin per protocol, oxygen support initially.',
      procedures: 'Primary PCI – LAD stent (DES). Right radial access. IV cannulation, Foley catheter (removed day 2).',
      dischargeCondition: 'Stable, ambulant, afebrile. No chest pain. BP and heart rate controlled.',
      medications: 'Tab. Aspirin 150 mg OD, Tab. Clopidogrel 75 mg OD, Tab. Atorvastatin 40 mg ON, Tab. Ramipril 2.5 mg OD, Tab. Metoprolol 25 mg BD. Continue for 12 months then review.',
      advice: 'Strict compliance with dual antiplatelets. Avoid heavy exertion for 6 weeks. Cardiac rehabilitation. Low-fat diet, salt restriction.',
      followUp: 'Cardiology OPD in 2 weeks with ECG and Echo. Earlier if chest pain or breathlessness.',
      redFlags: 'Return immediately if chest pain, syncope, bleeding, or severe dyspnoea.',
    },
    {
      uhid: 'UH2002',
      ipid: 'IP3002',
      mobile: '9876543211',
      patientName: 'Lakshmi Devi',
      age: '62',
      gender: 'Female',
      department: 'Neurology',
      admissionDate: '2026-01-30',
      dischargeDate: '2026-02-10',
      provisionalDiagnosis: 'Acute stroke',
      finalDiagnosis: 'Acute ischaemic stroke, left MCA territory (I63.5). Hypertension.',
      icd10Codes: ['I63.5', 'I10'],
      courseInHospital: 'Patient brought with right-sided weakness and slurred speech of 4 hours duration. NIHSS 12. CT brain showed early ischaemic changes in left MCA territory. Thrombolysis considered; outside window. Admitted to stroke unit. MRI brain confirmed acute infarct. Swallow screen passed. Started on antiplatelets, statin, BP control. Physiotherapy and speech therapy initiated. Gradual improvement in power and speech. No complications. Discharged for continued rehabilitation.',
      investigations: 'CT brain, MRI brain with DWI, carotid Doppler, ECG, 2D Echo, lipid profile, HbA1c, coagulation profile, CBC, RFT, LFT.',
      treatment: 'Tab. Aspirin 150 mg OD, Atorvastatin 40 mg, Amlodipine 5 mg OD. IV fluids, DVT prophylaxis. Physiotherapy and speech therapy.',
      procedures: 'IV cannulation. Bladder scan (no retention). Nasogastric tube not required.',
      dischargeCondition: 'Conscious, oriented. Right hemiparesis improving (power 3/5). Speech intelligible. Swallowing safe.',
      medications: 'Tab. Aspirin 150 mg OD, Tab. Atorvastatin 40 mg ON, Tab. Amlodipine 5 mg OD. Continue antihypertensives as per BP.',
      advice: 'Salt restriction, regular medications. Home physiotherapy. Fall precautions.',
      followUp: 'Neurology OPD in 2 weeks. Physiotherapy and speech therapy follow-up. Repeat lipid profile in 6 weeks.',
      redFlags: 'Return if worsening weakness, seizure, fever, or swallowing difficulty.',
    },
    {
      uhid: 'UH2003',
      ipid: 'IP3003',
      mobile: '9876543212',
      patientName: 'Suresh Pillai',
      age: '45',
      gender: 'Male',
      department: 'General Medicine',
      admissionDate: '2026-02-01',
      dischargeDate: '2026-02-08',
      provisionalDiagnosis: 'Sepsis, source unknown',
      finalDiagnosis: 'Severe sepsis secondary to community-acquired pneumonia (A41.9, J18.9)',
      icd10Codes: ['A41.9', 'J18.9'],
      courseInHospital: 'Patient presented with high-grade fever, cough, and breathlessness. Tachypnoeic, hypoxic. CXR showed right lower zone consolidation. Blood culture later grew Streptococcus pneumoniae. Admitted to ICU. Started on empirical broad-spectrum antibiotics; de-escalated to Ceftriaxone per sensitivity. Oxygen via face mask; weaned to room air by day 5. Inotropes not required. Renal function remained normal. Afebrile from day 4. Discharged on oral antibiotics to complete 7 days.',
      investigations: 'Blood culture, urine culture, sputum culture, CBC, CRP, procalcitonin, RFT, LFT, electrolytes, CXR, CT chest (day 2), arterial blood gas.',
      treatment: 'IV Ceftriaxone 2 g BD, IV fluids, oxygen therapy, antipyretics. Step-down to oral Amoxicillin-clavulanate for completion.',
      procedures: 'Central line (removed day 4). IV cannulation. Urinary catheter (removed day 2).',
      dischargeCondition: 'Afebrile, maintaining SpO2 on room air. Cough reduced. Tolerating orally.',
      medications: 'Tab. Amoxicillin-clavulanate 625 mg TDS for 5 more days. Multivitamins.',
      advice: 'Complete antibiotic course. Rest. Return if fever or breathlessness recurs.',
      followUp: 'Medicine OPD in 1 week with repeat CXR. Earlier if symptoms worsen.',
      redFlags: 'High fever, increasing breathlessness, confusion, or poor oral intake.',
    },
    {
      uhid: 'UH2004',
      ipid: 'IP3004',
      mobile: '9876543213',
      patientName: 'Kavitha Nair',
      age: '52',
      gender: 'Female',
      department: 'Orthopedics',
      admissionDate: '2026-01-25',
      dischargeDate: '2026-02-06',
      provisionalDiagnosis: 'Fracture neck of femur',
      finalDiagnosis: 'Intertrochanteric fracture right femur, status post dynamic hip screw (S72.11)',
      icd10Codes: ['S72.11'],
      courseInHospital: 'Patient sustained fall at home with right hip pain and inability to bear weight. X-ray and CT confirmed intertrochanteric fracture. Pre-op optimisation: Hb corrected, diabetes controlled. Underwent DHS fixation under spinal anaesthesia. Post-op mobilisation with physiotherapy; weight-bearing as tolerated from day 3. Wound healed. No DVT on screening. Discharged with walker support.',
      investigations: 'X-ray hip (AP/lateral), CT hip, CBC, RFT, LFT, blood sugar, HbA1c, ECG, chest X-ray, Doppler lower limbs (post-op).',
      treatment: 'DHS fixation. DVT prophylaxis (LMWH), analgesics, IV antibiotics (24 h). Physiotherapy.',
      procedures: 'Dynamic hip screw fixation, right hip. Spinal anaesthesia. IV cannulation, Foley catheter (removed day 1).',
      dischargeCondition: 'Stable, mobilising with walker. Wound dry. Pain controlled on oral analgesics.',
      medications: 'Tab. Paracetamol 500 mg QID PRN, Tab. Calcium + Vitamin D OD, Tab. Pantoprazole 40 mg OD. LMWH for 4 weeks (continue at home as advised).',
      advice: 'Weight-bearing as tolerated. Physiotherapy. Fall prevention. Do not miss LMWH.',
      followUp: 'Orthopedics OPD in 2 weeks for suture removal and X-ray. Physiotherapy follow-up.',
      redFlags: 'Redness or discharge from wound, fever, sudden leg swelling or chest pain.',
    },
    {
      uhid: 'UH2005',
      ipid: 'IP3005',
      mobile: '9876543214',
      patientName: 'Venkat Reddy',
      age: '67',
      gender: 'Male',
      department: 'Pulmonology',
      admissionDate: '2026-01-29',
      dischargeDate: '2026-02-04',
      provisionalDiagnosis: 'COPD exacerbation',
      finalDiagnosis: 'Acute exacerbation of COPD (J44.1). Type 2 respiratory failure, resolved.',
      icd10Codes: ['J44.1', 'J96.01'],
      courseInHospital: 'Known COPD on home oxygen. Presented with increased breathlessness, cough, and purulent sputum. ABG showed type 2 respiratory failure. Admitted to ICU; started on NIV, nebulisations, IV steroids, and antibiotics. Gradually weaned off NIV. Oxygen requirement reduced to 2 L/min. Sputum culture showed no resistant organisms. Discharged on increased inhaler therapy and short course of oral steroids.',
      investigations: 'ABG (serial), CBC, CRP, RFT, electrolytes, CXR, ECG, sputum culture, PFT (prior).',
      treatment: 'NIV initially, oxygen therapy. IV Methylprednisolone, IV Ceftriaxone, nebulised Bronchodilators and steroids. Oral Prednisolone taper, stepped-up inhalers.',
      procedures: 'Non-invasive ventilation. IV cannulation. Arterial line (removed day 2).',
      dischargeCondition: 'Comfortable at rest on 2 L O2. No distress. ABG acceptable.',
      medications: 'Inhaler: Budesonide-formoterol 400/12 mcg 2 puffs BD. Tab. Prednisolone 30 mg OD tapering over 10 days. Tab. Doxofylline 400 mg BD. Home oxygen 2 L/min.',
      advice: 'Smoking cessation. Vaccination (flu, pneumococcal). Compliance with inhalers. Pulmonary rehabilitation.',
      followUp: 'Pulmonology OPD in 1 week. ABG and spirometry in 4 weeks.',
      redFlags: 'Worsening breathlessness, bluish discolouration, confusion, or inability to manage at home.',
    },
    {
      uhid: 'UH2006',
      ipid: 'IP3006',
      mobile: '9876543215',
      patientName: 'Deepa Iyer',
      age: '55',
      gender: 'Female',
      department: 'Endocrinology',
      admissionDate: '2026-02-02',
      dischargeDate: '2026-02-09',
      provisionalDiagnosis: 'Diabetic foot infection',
      finalDiagnosis: 'Diabetic foot ulcer with cellulitis and osteomyelitis (L08.9, E11.69)',
      icd10Codes: ['L08.9', 'E11.69'],
      courseInHospital: 'Known diabetic with non-healing ulcer over left heel for 3 weeks. Admitted with cellulitis and suspected osteomyelitis. MRI foot confirmed osteomyelitis. Wound debridement and culture; started on IV Piperacillin-tazobactam per sensitivity. Diabetic control optimised with insulin sliding scale. Podiatry and wound care. No amputation required. Discharged on oral antibiotics for 6 weeks and strict foot care.',
      investigations: 'Wound culture, MRI foot, CBC, CRP, RFT, LFT, HbA1c, fasting and PP blood sugar, X-ray foot.',
      treatment: 'IV Piperacillin-tazobactam 4.5 g TDS. Wound debridement and daily dressings. Insulin for glycaemic control. Offloading with special footwear.',
      procedures: 'Wound debridement (bedside). IV cannulation. No surgical amputation.',
      dischargeCondition: 'Wound smaller, clean, granulating. Afebrile. Blood sugar controlled on oral agents and basal insulin.',
      medications: 'Tab. Ciprofloxacin 750 mg BD for 6 weeks. Tab. Metformin 1 g BD, Tab. Sitagliptin 100 mg OD, Inj. Insulin Glargine 20 U at night. Multivitamins.',
      advice: 'Strict foot care. Daily inspection. Proper footwear. Never walk barefoot. Glycaemic control.',
      followUp: 'Endocrinology and Podiatry OPD in 1 week. Wound review. Repeat HbA1c in 8 weeks.',
      redFlags: 'Fever, spreading redness, black discolouration of toe/foot, or worsening pain.',
    },
    {
      uhid: 'UH2007',
      ipid: 'IP3007',
      mobile: '9876543216',
      patientName: 'Arun Sharma',
      age: '48',
      gender: 'Male',
      department: 'Gastroenterology',
      admissionDate: '2026-01-27',
      dischargeDate: '2026-02-07',
      provisionalDiagnosis: 'Acute pancreatitis',
      finalDiagnosis: 'Acute gallstone pancreatitis, moderate severity (K85.1)',
      icd10Codes: ['K85.1', 'K80.00'],
      courseInHospital: 'Presented with severe epigastric pain and vomiting. Serum amylase and lipase markedly elevated. USG and CECT abdomen confirmed acute pancreatitis with gallstones; no necrosis. Managed with nil orally, IV fluids, analgesics, and antibiotics. Gradual introduction of oral feeds. No ERCP needed in acute phase. Planned for elective cholecystectomy. Discharged on low-fat diet and analgesics PRN.',
      investigations: 'Serum amylase, lipase, CBC, RFT, LFT, calcium, triglycerides, USG abdomen, CECT abdomen, MRCP.',
      treatment: 'Nil orally initially. IV fluids, IV analgesics (tramadol), IV Ceftriaxone. Gradual oral refeeding. PPI.',
      procedures: 'IV cannulation. NG tube (removed day 2). No ERCP in this admission.',
      dischargeCondition: 'Pain-free, tolerating soft diet. Amylase/lipase trending down. No organ failure.',
      medications: 'Tab. Pantoprazole 40 mg OD, Tab. Pancreatin with enzymes with meals. Tab. Paracetamol PRN. Low-fat diet.',
      advice: 'Strict low-fat diet. Avoid alcohol. Elective cholecystectomy to be planned in 6–8 weeks.',
      followUp: 'Surgery OPD for cholecystectomy planning in 4 weeks. Gastroenterology OPD if pain recurs.',
      redFlags: 'Severe abdominal pain, persistent vomiting, fever, or jaundice.',
    },
    {
      uhid: 'UH2008',
      ipid: 'IP3008',
      mobile: '9876543217',
      patientName: 'Revathi Menon',
      age: '60',
      gender: 'Female',
      department: 'Nephrology',
      admissionDate: '2026-01-31',
      dischargeDate: '2026-02-08',
      provisionalDiagnosis: 'CKD with fluid overload',
      finalDiagnosis: 'Chronic kidney disease stage 4 (N18.4), acute on chronic kidney injury with volume overload',
      icd10Codes: ['N18.4', 'N17.9'],
      courseInHospital: 'Known CKD on regular follow-up. Presented with leg swelling and breathlessness. Creatinine elevated from baseline; hyperkalaemia. Admitted for diuresis and electrolyte correction. Temporary dialysis not required. Responded to IV diuretics and potassium restriction. Discharged with revised medication and fluid restriction. Plan for long-term dialysis discussed.',
      investigations: 'CBC, RFT, electrolytes (serial), LFT, albumin, urine routine, USG abdomen, ECG, 2D Echo.',
      treatment: 'IV Furosemide, fluid restriction 1 L/day, potassium-binding resin, correction of acidosis. Hold ACE-i temporarily. Restart at lower dose.',
      procedures: 'IV cannulation. No dialysis in this admission.',
      dischargeCondition: 'Oedema reduced. Potassium normal. Breathlessness improved. Tolerating diet with fluid restriction.',
      medications: 'Tab. Furosemide 40 mg BD, Tab. Calcium acetate with meals, Tab. B complex. Restrict fluids to 1 L/day. Low potassium diet.',
      advice: 'Strict fluid and salt restriction. Avoid NSAIDs. Nephrology follow-up. Prepare for dialysis access when advised.',
      followUp: 'Nephrology OPD in 1 week with RFT and electrolytes. Earlier if swelling or breathlessness worsens.',
      redFlags: 'Decreased urine output, severe swelling, breathlessness at rest, or confusion.',
    },
    {
      uhid: 'UH2009',
      ipid: 'IP3009',
      mobile: '9876543218',
      patientName: 'Gopal Patel',
      age: '70',
      gender: 'Male',
      department: 'Surgery',
      admissionDate: '2026-02-01',
      dischargeDate: '2026-02-12',
      provisionalDiagnosis: 'Acute abdomen',
      finalDiagnosis: 'Perforated duodenal ulcer, status post Graham patch repair (K26.5)',
      icd10Codes: ['K26.5'],
      courseInHospital: 'Presented with sudden severe abdominal pain and guarding. Erect X-ray showed free air under diaphragm. Emergency laparotomy: perforated duodenal ulcer; Graham patch repair and peritoneal lavage done. Post-op ICU for 24 h. Gradual oral feeds from day 4. Wound healed. Discharged on PPI and Helicobacter eradication to be started after review.',
      investigations: 'Erect X-ray abdomen, CBC, RFT, LFT, amylase, lipase, USG abdomen. Per-operative findings documented.',
      treatment: 'Emergency laparotomy – Graham patch. IV antibiotics, IV fluids, analgesics. PPI. Gradual oral diet.',
      procedures: 'Emergency laparotomy, Graham patch repair, peritoneal lavage. Nasogastric tube (removed day 3). Drain (removed day 2).',
      dischargeCondition: 'Afebrile, wound dry. Tolerating soft diet. Bowel movements normal.',
      medications: 'Tab. Pantoprazole 40 mg BD for 8 weeks. Tab. Amoxicillin 500 mg TDS + Tab. Clarithromycin 500 mg BD + Tab. Metronidazole 400 mg TDS for 14 days (H. pylori eradication – start after OPD review).',
      advice: 'Avoid NSAIDs. Small frequent meals. H. pylori eradication as advised. Report if abdominal pain or vomiting.',
      followUp: 'Surgery OPD in 2 weeks for suture removal and plan H. pylori eradication. Endoscopy in 8 weeks.',
      redFlags: 'Severe abdominal pain, vomiting, fever, or wound discharge.',
    },
    {
      uhid: 'UH2010',
      ipid: 'IP3010',
      mobile: '9876543219',
      patientName: 'Vasantha Singh',
      age: '38',
      gender: 'Female',
      department: 'Pediatrics',
      admissionDate: '2026-02-03',
      dischargeDate: '2026-02-09',
      provisionalDiagnosis: 'Severe dengue with warning signs',
      finalDiagnosis: 'Dengue fever with warning signs (A90). Recovered.',
      icd10Codes: ['A90'],
      courseInHospital: 'Child presented with high fever, rash, and vomiting. NS1 antigen positive. Platelets dropped to 85,000; haematocrit rising. Admitted for monitoring. IV fluids as per protocol. No bleeding or shock. Platelets and haematocrit stabilised. Afebrile from day 5. Discharged with advice for rest and oral fluids.',
      investigations: 'NS1 antigen, IgM dengue, CBC (daily), RFT, LFT, ultrasound abdomen for ascites/pleural effusion.',
      treatment: 'IV fluids (crystalloid) as per WHO dengue protocol. Antipyretics. No platelet transfusion required. Oral fluids encouraged when tolerating.',
      procedures: 'IV cannulation. Monitoring of vitals and urine output.',
      dischargeCondition: 'Afebrile 48 hours. Platelets rising. Good oral intake. No bleeding.',
      medications: 'Tab. Paracetamol PRN for fever. Oral rehydration. Multivitamins.',
      advice: 'Adequate rest and fluids. Avoid bruising. No aspirin/NSAIDs. Mosquito protection.',
      followUp: 'Paediatric OPD in 1 week with CBC. Earlier if fever, bleeding, or lethargy.',
      redFlags: 'Return if bleeding, severe abdominal pain, persistent vomiting, cold extremities, or lethargy.',
    },
    {
      uhid: 'UH2011',
      ipid: 'IP3011',
      mobile: '9876543220',
      patientName: 'Mohan Krishnan',
      age: '64',
      gender: 'Male',
      department: 'Cardiology',
      admissionDate: '2026-02-04',
      dischargeDate: '2026-02-14',
      provisionalDiagnosis: 'Cardiogenic shock post-STEMI',
      finalDiagnosis: 'STEMI with cardiogenic shock, status post primary PCI, IABP support (I21.0, R57.0)',
      icd10Codes: ['I21.0', 'R57.0'],
      courseInHospital: 'Patient collapsed with cardiac arrest; ROSC after 8 min CPR. ECG showed anterior STEMI. Emergency angiography: critical LAD and LCx; primary PCI to both vessels with DES. IABP inserted for cardiogenic shock. Inotropes and mechanical ventilation for 72 h. IABP weaned day 5. Echo at discharge: LVEF 28%, severe LV dysfunction. Discharged on GDMT and planned for ICD consideration.',
      investigations: 'Troponin I (peak 45 ng/mL), CK-MB, ECG, 2D Echo (serial), coronary angiography, IABP insertion, CBC, RFT, ABG, lactate.',
      treatment: 'Primary PCI (LAD + LCx). IABP, inotropes (Noradrenaline, Dobutamine), mechanical ventilation. Dual antiplatelets, statin, ACE-i, beta-blocker, aldosterone antagonist.',
      procedures: 'CPR, intubation. Primary PCI – LAD and LCx stents. IABP insertion (removed day 5). Central line, arterial line, Foley.',
      dischargeCondition: 'Off inotropes and IABP. Conscious, extubated. BP maintained. On room air. LVEF 28%.',
      medications: 'Tab. Aspirin 150 mg OD, Tab. Ticagrelor 90 mg BD, Tab. Atorvastatin 40 mg ON, Tab. Ramipril 2.5 mg OD, Tab. Carvedilol 3.125 mg BD, Tab. Spironolactone 25 mg OD.',
      advice: 'Strict compliance. Salt and fluid restriction. Cardiac rehab when cleared. ICD evaluation in 6–12 weeks.',
      followUp: 'Cardiology OPD in 1 week. Echo and ICD counselling in 6 weeks.',
      redFlags: 'Chest pain, syncope, severe breathlessness, or leg swelling.',
    },
    {
      uhid: 'UH2012',
      ipid: 'IP3012',
      mobile: '9876543221',
      patientName: 'Shantha Rao',
      age: '55',
      gender: 'Female',
      department: 'Pulmonology',
      admissionDate: '2026-02-05',
      dischargeDate: '2026-02-12',
      provisionalDiagnosis: 'Massive PE',
      finalDiagnosis: 'Acute massive pulmonary embolism with RV dysfunction (I26.01). DVT left lower limb.',
      icd10Codes: ['I26.01', 'I80.3'],
      courseInHospital: 'Presented with sudden severe breathlessness, pleuritic pain, and haemoptysis. CTPA showed massive PE with right heart strain. Troponin and NT-proBNP elevated. Thrombolysis with alteplase given. Heparin infusion started. Clinical improvement over 48 h. Doppler confirmed left popliteal DVT. Discharged on oral anticoagulation with plan for 3 months minimum.',
      investigations: 'CTPA, ECG, troponin, NT-proBNP, D-dimer, Doppler lower limbs, CBC, RFT, coagulation profile.',
      treatment: 'Thrombolysis (alteplase). Therapeutic heparin then switched to DOAC. Oxygen, analgesia.',
      procedures: 'IV cannulation. No catheter-directed thrombolysis or embolectomy required.',
      dischargeCondition: 'Comfortable at rest. SpO2 96% room air. No haemodynamic compromise.',
      medications: 'Tab. Rivaroxaban 15 mg BD for 21 days then 20 mg OD. Continue 3 months minimum. Repeat imaging if advised.',
      advice: 'Avoid prolonged immobility. Compression stockings. Do not miss anticoagulant.',
      followUp: 'Pulmonology / Haematology OPD in 2 weeks. Repeat CTPA in 3 months if indicated.',
      redFlags: 'Sudden breathlessness, chest pain, haemoptysis, or leg swelling.',
    },
    {
      uhid: 'UH2013',
      ipid: 'IP3013',
      mobile: '9876543222',
      patientName: 'Ramesh Iyengar',
      age: '72',
      gender: 'Male',
      department: 'Gastroenterology',
      admissionDate: '2026-02-06',
      dischargeDate: '2026-02-11',
      provisionalDiagnosis: 'Upper GI bleed',
      finalDiagnosis: 'Acute upper gastrointestinal haemorrhage from duodenal ulcer (K92.2). Severe anaemia.',
      icd10Codes: ['K92.2', 'D50.0'],
      courseInHospital: 'Presented with haematemesis and melaena. Hb 5.2 g/dL at admission. Resuscitated with blood and fluids. Urgent endoscopy: Forrest IIa duodenal ulcer with visible vessel; adrenaline injection and clip applied. No rebleed. Hb stabilised at 8.1 g/dL. Started on PPI infusion then oral. H. pylori positive; eradication planned post-discharge.',
      investigations: 'OGD, CBC (serial), RFT, LFT, coagulation, group and crossmatch, H. pylori test.',
      treatment: 'Blood transfusion (4 units). IV PPI. Endoscopic haemostasis. Oral PPI. Nil orally 24 h then gradual diet.',
      procedures: 'Upper GI endoscopy with adrenaline injection and clip application. IV cannulation, central line.',
      dischargeCondition: 'Stable. No further bleed. Hb 8.1. Tolerating diet. Melaena stopped.',
      medications: 'Tab. Pantoprazole 40 mg BD for 8 weeks. Tab. Amoxicillin 500 mg TDS + Tab. Clarithromycin 500 mg BD + Tab. Metronidazole 400 mg TDS for 14 days (H. pylori). Iron supplements.',
      advice: 'Avoid NSAIDs and alcohol. Complete H. pylori eradication. High-protein diet.',
      followUp: 'Gastroenterology OPD in 2 weeks. Repeat endoscopy in 8 weeks if indicated.',
      redFlags: 'Fresh blood in vomit or stool, dizziness, or collapse.',
    },
    {
      uhid: 'UH2014',
      ipid: 'IP3014',
      mobile: '9876543223',
      patientName: 'Meenakshi Subramanian',
      age: '34',
      gender: 'Female',
      department: 'Neurology',
      admissionDate: '2026-02-07',
      dischargeDate: '2026-02-15',
      provisionalDiagnosis: 'Status epilepticus',
      finalDiagnosis: 'Refractory status epilepticus (G41.01). New-onset epilepsy, aetiology under evaluation.',
      icd10Codes: ['G41.01'],
      courseInHospital: 'Brought in convulsing; continued for 45 min despite lorazepam and phenytoin. Intubated and loaded with valproate and levetiracetam. EEG showed ongoing seizure activity; midazolam infusion started. Seizures controlled by 24 h. MRI brain and CSF normal. Weaned off sedation. Started on dual AEDs. No further seizures. Discharged on levetiracetam and valproate.',
      investigations: 'EEG (serial), MRI brain, CSF analysis, metabolic panel, anticonvulsant levels, CBC, RFT, LFT.',
      treatment: 'Intubation, midazolam infusion. Loading doses: phenytoin, valproate, levetiracetam. Maintenance AEDs.',
      procedures: 'Intubation. EEG monitoring. IV cannulation, central line.',
      dischargeCondition: 'Conscious, extubated. No seizures for 5 days. Tolerating orally.',
      medications: 'Tab. Levetiracetam 500 mg BD, Tab. Sodium valproate 500 mg BD. Do not stop suddenly.',
      advice: 'Compliance with AEDs. Avoid sleep deprivation and alcohol. No driving until cleared.',
      followUp: 'Neurology OPD in 2 weeks. EEG and MRI review. Consider tapering to single AED after 6 months.',
      redFlags: 'Recurrent fits, prolonged confusion, or fall.',
    },
    {
      uhid: 'UH2015',
      ipid: 'IP3015',
      mobile: '9876543224',
      patientName: 'Sivaraman Nambiar',
      age: '48',
      gender: 'Male',
      department: 'Gastroenterology',
      admissionDate: '2026-02-02',
      dischargeDate: '2026-02-16',
      provisionalDiagnosis: 'Acute liver failure',
      finalDiagnosis: 'Acute-on-chronic liver failure (K72.01). Alcoholic hepatitis. Hepatic encephalopathy, resolved.',
      icd10Codes: ['K72.01', 'K70.30'],
      courseInHospital: 'Known alcoholic. Presented with jaundice, ascites, and confusion. INR 2.8, bilirubin 18 mg/dL, MELD 28. Admitted to ICU. Treated for hepatic encephalopathy (lactulose, rifaximin). Paracentesis for tense ascites. No variceal bleed. Gradual improvement in sensorium and LFT. Alcohol cessation counselling. Discharged with strict abstinence and follow-up for possible transplant listing.',
      investigations: 'LFT, INR, bilirubin (serial), ammonia, USG abdomen, ascitic fluid analysis, viral markers, MELD score.',
      treatment: 'Lactulose, rifaximin. IV fluids, correction of electrolytes. Therapeutic paracentesis. PPI. Abstinence.',
      procedures: 'Paracentesis. IV cannulation. No endoscopy (no bleed).',
      dischargeCondition: 'Alert, oriented. Jaundice improving. Ascites reduced. INR 1.8. Abstinent.',
      medications: 'Tab. Lactulose 30 mL BD, Tab. Rifaximin 550 mg BD, Tab. Furosemide 40 mg OD, Tab. Spironolactone 100 mg OD. Multivitamins. Strict no alcohol.',
      advice: 'Absolute alcohol abstinence. Low-salt diet. Return for any confusion or bleeding.',
      followUp: 'Hepatology OPD in 1 week. Repeat LFT and INR. Transplant workup as advised.',
      redFlags: 'Confusion, vomiting blood, black stools, or fever.',
    },
    {
      uhid: 'UH2016',
      ipid: 'IP3016',
      mobile: '9876543225',
      patientName: 'Padmini Gowda',
      age: '42',
      gender: 'Female',
      department: 'Surgery',
      admissionDate: '2026-02-08',
      dischargeDate: '2026-02-22',
      provisionalDiagnosis: 'Polytrauma RTA',
      finalDiagnosis: 'Polytrauma: open fracture tibia (S82.21), splenic laceration s/p splenectomy (S36.03), pelvic fracture (S32.5)',
      icd10Codes: ['S82.21', 'S36.03', 'S32.5'],
      courseInHospital: 'RTA victim. ATLS protocol. CT revealed splenic laceration (grade 4) and pelvic fracture. Emergency laparotomy and splenectomy. Ortho: open tibia fracture – wound debridement, external fixator. ICU for 48 h. Vaccination for asplenia. Mobilisation with non-weight-bearing on right leg. Wound and fracture care. Discharged with fixator in situ for staged fixation.',
      investigations: 'CT trauma series (head, chest, abdomen, pelvis), X-ray limbs, FAST, CBC, RFT, coagulation. Repeat imaging as needed.',
      treatment: 'Emergency splenectomy. External fixator tibia. DVT prophylaxis. Vaccines (pneumococcal, H. influenzae, meningococcal). Analgesia, wound care.',
      procedures: 'Laparotomy, splenectomy. Wound debridement, external fixator application (tibia). Chest tube (removed day 2).',
      dischargeCondition: 'Stable. Afebrile. Wound clean. Non-weight-bearing right leg. Vaccinated.',
      medications: 'Tab. Paracetamol 500 mg QID PRN, Tab. Pantoprazole 40 mg OD. LMWH for 4 weeks. Calcium and vitamin D. Lifelong antibiotic prophylaxis as per asplenia protocol.',
      advice: 'Non-weight-bearing. Physiotherapy. Watch for fever (overwhelming post-splenectomy infection).',
      followUp: 'Surgery and Orthopedics OPD in 2 weeks. Plan for definitive tibia fixation. Repeat imaging.',
      redFlags: 'Fever, wound discharge, chest pain, or shortness of breath.',
    },
    {
      uhid: 'UH2017',
      ipid: 'IP3017',
      mobile: '9876543226',
      patientName: 'Krishnamurthy Pillai',
      age: '68',
      gender: 'Male',
      department: 'Cardiothoracic Surgery',
      admissionDate: '2026-02-09',
      dischargeDate: '2026-02-20',
      provisionalDiagnosis: 'Aortic dissection',
      finalDiagnosis: 'Stanford type A aortic dissection, status post Bentall procedure (I71.01)',
      icd10Codes: ['I71.01'],
      courseInHospital: 'Sudden severe tearing chest pain. CT aortogram: Type A dissection from root to arch. Emergency Bentall procedure (composite graft, aortic valve replacement) under DHCA. Post-op stable in ICU. No neurological deficit. BP controlled. Discharged on anticoagulation (mechanical valve) and antihypertensives.',
      investigations: 'CT aortogram, ECG, 2D Echo, CBC, RFT, coagulation. Intraoperative findings documented.',
      treatment: 'Emergency Bentall procedure. Mechanical valve – lifelong anticoagulation. Strict BP control.',
      procedures: 'Bentall procedure (composite valve conduit, coronary reimplantation). Deep hypothermic circulatory arrest.',
      dischargeCondition: 'Stable. BP controlled. INR therapeutic. No neurological deficit.',
      medications: 'Tab. Warfarin as per INR (target 2.5–3.5). Tab. Metoprolol 50 mg BD, Tab. Amlodipine 5 mg OD. Do not miss warfarin.',
      advice: 'Strict BP control. INR monitoring weekly initially. Avoid heavy lifting. Report chest pain or stroke symptoms.',
      followUp: 'Cardiothoracic OPD in 2 weeks. INR clinic. Echo at 6 weeks.',
      redFlags: 'Chest pain, weakness, slurred speech, or bleeding.',
    },
    {
      uhid: 'UH2018',
      ipid: 'IP3018',
      mobile: '9876543227',
      patientName: 'Lalitha Menon',
      age: '61',
      gender: 'Female',
      department: 'Vascular Surgery',
      admissionDate: '2026-02-10',
      dischargeDate: '2026-02-14',
      provisionalDiagnosis: 'Acute limb ischemia',
      finalDiagnosis: 'Acute embolic occlusion right popliteal artery (I74.3). Atrial fibrillation.',
      icd10Codes: ['I74.3', 'I48.19'],
      courseInHospital: 'Known AF on anticoagulation. Sudden onset cold, painful, pale right leg. No Doppler signals below knee. Emergency embolectomy via femoral approach; thrombus retrieved. Limb reperfused. Post-op anticoagulation with heparin then DOAC. Limb salvaged. Discharged on DOAC and rate control.',
      investigations: 'Doppler arterial, CT angiogram lower limb, ECG, 2D Echo (cardiac source), CBC, RFT, coagulation.',
      treatment: 'Emergency embolectomy. Heparin then Rivaroxaban. Rate control for AF. Limb perfusion restored.',
      procedures: 'Fogarty embolectomy, right lower limb. Fasciotomy not required.',
      dischargeCondition: 'Limb viable. Pedal pulses present. No compartment syndrome. On DOAC.',
      medications: 'Tab. Rivaroxaban 20 mg OD. Tab. Metoprolol 25 mg BD. Continue DOAC long-term for AF.',
      advice: 'Do not miss anticoagulant. Report any recurrence of cold/pain in limb or chest pain.',
      followUp: 'Vascular surgery OPD in 2 weeks. Cardiology for AF follow-up.',
      redFlags: 'Cold or painful limb, chest pain, or bleeding.',
    },
    {
      uhid: 'UH2019',
      ipid: 'IP3019',
      mobile: '9876543228',
      patientName: 'Balakrishnan Reddy',
      age: '52',
      gender: 'Male',
      department: 'Gastroenterology',
      admissionDate: '2026-02-11',
      dischargeDate: '2026-02-18',
      provisionalDiagnosis: 'Toxic megacolon',
      finalDiagnosis: 'Toxic megacolon complicating ulcerative colitis (K51.01). Resolved with medical management.',
      icd10Codes: ['K51.01'],
      courseInHospital: 'Known UC. Presented with severe bloody diarrhoea, abdominal distension, and fever. AXR and CT: toxic megacolon (transverse colon 8 cm). ICU admission. IV steroids, cyclosporine, antibiotics. No perforation. Gradual improvement; colonic diameter reduced. Stepped down to oral steroids and mesalamine. Surgery deferred; plan for elective colectomy if refractory.',
      investigations: 'AXR, CT abdomen, CBC, CRP, electrolytes, albumin, stool culture and C. difficile. Colonoscopy deferred in acute phase.',
      treatment: 'IV Methylprednisolone, IV Cyclosporine. IV antibiotics (cover for translocation). Fluid and electrolyte correction. Nil orally initially.',
      procedures: 'IV cannulation. NG tube (decompression). No surgery in this admission.',
      dischargeCondition: 'Afebrile. Abdomen soft. Diarrhoea reduced. Colon diameter improved. On oral steroids and 5-ASA.',
      medications: 'Tab. Prednisolone 40 mg OD tapering. Tab. Mesalamine 1.2 g TDS. Tab. Azathioprine to be started in OPD. Probiotics.',
      advice: 'Complete steroid taper. Avoid NSAIDs. Low-residue diet. Report worsening diarrhoea or abdominal distension.',
      followUp: 'Gastroenterology OPD in 1 week. Plan for maintenance and possible colectomy discussion.',
      redFlags: 'Fever, severe distension, or blood in stool.',
    },
    {
      uhid: 'UH2020',
      ipid: 'IP3020',
      mobile: '9876543229',
      patientName: 'Chandrika Nair',
      age: '28',
      gender: 'Female',
      department: 'Critical Care',
      admissionDate: '2026-02-12',
      dischargeDate: '2026-02-21',
      provisionalDiagnosis: 'ARDS',
      finalDiagnosis: 'Acute respiratory distress syndrome (ARDS) secondary to viral pneumonia (J80, J12.89)',
      icd10Codes: ['J80', 'J12.89'],
      courseInHospital: 'Young female with fever and cough; rapidly progressed to severe hypoxemia. CXR and CT: bilateral infiltrates. Intubated and mechanically ventilated. ARDS protocol: low tidal volume, prone positioning. No bacterial superinfection. Gradually improved. Weaned and extubated on day 7. Oxygen weaned to room air by day 12. Discharged for pulmonary rehab.',
      investigations: 'CXR, CT chest, ABG (serial), viral PCR (influenza, COVID, others), procalcitonin, cultures. Echocardiography (no cardiac cause).',
      treatment: 'Mechanical ventilation (lung-protective). Prone positioning. Supportive care. No steroids in this case. Tracheostomy not required.',
      procedures: 'Intubation. Mechanical ventilation. Central line. Arterial line. No ECMO required.',
      dischargeCondition: 'Extubated. Room air. Mobilising. No fever. CXR improving.',
      medications: 'Multivitamins. Pulmonary rehabilitation as advised. No long-term medications.',
      advice: 'Pulmonary rehabilitation. Gradual return to activity. Vaccination (flu, COVID).',
      followUp: 'Pulmonology OPD in 2 weeks. Repeat CXR and PFT in 6 weeks.',
      redFlags: 'Return of breathlessness, fever, or chest pain.',
    },
  ];

  return raw.map((rec, i) => {
    const age = rec.age || '';
    const gender = rec.gender || '';
    const title = gender === 'Female' ? 'Mrs.' : 'Mr.';
    const genderDesc = gender === 'Female' ? 'female' : 'male';
    const reasonForAdmission = `${title} ${rec.patientName}, a ${age}-year-old ${genderDesc}, was admitted with complaints of ${(rec.provisionalDiagnosis || 'acute illness').toLowerCase()}. ${rec.courseInHospital ? rec.courseInHospital.split('.').slice(0, 2).join('.') + '.' : ''}`;
    const clinicalExamination = CLINICAL_EXAM_BY_DEPT[rec.department] || 'On admission, the patient was examined. Vitals: stable. Systemic examination: within normal limits for age. Further evaluation as documented.';

    return {
      ...rec,
      address: BIG_CASE_ADDRESSES[i] ?? BIG_CASE_ADDRESSES[0],
      consultant: CONSULTANT_BY_DEPARTMENT[rec.department] ?? 'Dr. Consultant, MD',
      wardBed: BIG_CASE_WARD_BEDS[i] ?? 'Ward 1 / Bed 1',
      reasonForAdmission,
      clinicalExamination,
    };
  });
}

/** Status distribution for 20 big-case records: mix of workflow stages */
export const BIG_CASE_STATUSES = Array(20).fill('DRAFT');

/** Status distribution: draft only */
export const STATUS_DISTRIBUTION = ['DRAFT'];

/**
 * Parse medications string into array of { name, dose, route, frequency, duration, notes }.
 * Splits on "Tab.", "Inj.", "Inhaler", "Cap." etc. and keeps first token as name, rest as dose/notes.
 */
function parseMedicationsString(str) {
  if (!str || !String(str).trim()) return [];
  const s = String(str).trim();
  const items = [];
  const segments = s.split(/\s*(?=Tab\.|Inhaler\s|Inj\.|Cap\.|Syp\.|Drop\s)/i).map((x) => x.trim()).filter(Boolean);
  for (const seg of segments.length ? segments : [s]) {
    const cleaned = seg.replace(/^(Tab\.|Inhaler|Inj\.|Cap\.|Syp\.|Drop)\.?\s*/i, '').trim();
    if (!cleaned) continue;
    const name = cleaned.split(/\s+\d+/)[0].trim() || cleaned.slice(0, 50);
    const rest = cleaned.slice(name.length).trim() || null;
    items.push({ name, dose: rest || null, route: null, frequency: null, duration: null, notes: null });
  }
  if (items.length === 0 && s) items.push({ name: s.slice(0, 80), dose: null, route: null, frequency: null, duration: null, notes: null });
  return items;
}

/** Lab investigation presets by department for realistic seed data */
const LAB_PRESETS = {
  'Cardiology': [
    { name: 'Hemoglobin', resultAdmission: '12.1 g/dL', resultDischarge: '12.4 g/dL', referenceRange: '13 - 17 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '12,400 /cu.mm', resultDischarge: '7,800 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'Serum Creatinine', resultAdmission: '1.8 mg/dL', resultDischarge: '1.2 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
    { name: 'Blood Urea', resultAdmission: '52 mg/dL', resultDischarge: '34 mg/dL', referenceRange: '10 - 45 mg/dL' },
    { name: 'Serum Sodium', resultAdmission: '134 mEq/L', resultDischarge: '140 mEq/L', referenceRange: '135 - 145 mEq/L' },
    { name: 'Serum Potassium', resultAdmission: '3.6 mEq/L', resultDischarge: '4.5 mEq/L', referenceRange: '3.5 - 5.1 mEq/L' },
    { name: 'Troponin I', resultAdmission: '28.5 ng/mL', resultDischarge: '1.2 ng/mL', referenceRange: '< 0.04 ng/mL' },
    { name: 'NT-proBNP', resultAdmission: '5,120 pg/mL', resultDischarge: '1,450 pg/mL', referenceRange: '< 125 pg/mL' },
    { name: 'HbA1c', resultAdmission: '9.2 %', resultDischarge: '-', referenceRange: '< 6.5%' },
    { name: 'Total Cholesterol', resultAdmission: '245 mg/dL', resultDischarge: '-', referenceRange: '< 200 mg/dL' },
  ],
  'Neurology': [
    { name: 'Hemoglobin', resultAdmission: '11.8 g/dL', resultDischarge: '12.0 g/dL', referenceRange: '12 - 16 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '9,200 /cu.mm', resultDischarge: '7,500 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'ESR', resultAdmission: '32 mm/hr', resultDischarge: '18 mm/hr', referenceRange: '0 - 20 mm/hr' },
    { name: 'Random Blood Sugar', resultAdmission: '186 mg/dL', resultDischarge: '124 mg/dL', referenceRange: '70 - 140 mg/dL' },
    { name: 'Serum Creatinine', resultAdmission: '1.1 mg/dL', resultDischarge: '0.9 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
    { name: 'Lipid Profile - LDL', resultAdmission: '162 mg/dL', resultDischarge: '-', referenceRange: '< 100 mg/dL' },
    { name: 'HbA1c', resultAdmission: '7.8 %', resultDischarge: '-', referenceRange: '< 6.5%' },
    { name: 'PT/INR', resultAdmission: '1.1', resultDischarge: '1.0', referenceRange: '0.8 - 1.2' },
  ],
  'General Medicine': [
    { name: 'Hemoglobin', resultAdmission: '10.4 g/dL', resultDischarge: '11.2 g/dL', referenceRange: '13 - 17 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '18,400 /cu.mm', resultDischarge: '8,200 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'Platelet Count', resultAdmission: '2.2 lakh/cu.mm', resultDischarge: '2.8 lakh/cu.mm', referenceRange: '1.5 - 4.0 lakh' },
    { name: 'CRP', resultAdmission: '128 mg/L', resultDischarge: '12 mg/L', referenceRange: '< 5 mg/L' },
    { name: 'Procalcitonin', resultAdmission: '8.5 ng/mL', resultDischarge: '0.3 ng/mL', referenceRange: '< 0.5 ng/mL' },
    { name: 'Serum Creatinine', resultAdmission: '1.4 mg/dL', resultDischarge: '1.0 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
    { name: 'Blood Urea', resultAdmission: '48 mg/dL', resultDischarge: '32 mg/dL', referenceRange: '10 - 45 mg/dL' },
    { name: 'Serum Sodium', resultAdmission: '131 mEq/L', resultDischarge: '139 mEq/L', referenceRange: '135 - 145 mEq/L' },
  ],
  'Orthopedics': [
    { name: 'Hemoglobin', resultAdmission: '8.6 g/dL', resultDischarge: '10.8 g/dL', referenceRange: '12 - 16 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '11,800 /cu.mm', resultDischarge: '7,600 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'Platelet Count', resultAdmission: '2.4 lakh/cu.mm', resultDischarge: '2.6 lakh/cu.mm', referenceRange: '1.5 - 4.0 lakh' },
    { name: 'Random Blood Sugar', resultAdmission: '168 mg/dL', resultDischarge: '112 mg/dL', referenceRange: '70 - 140 mg/dL' },
    { name: 'HbA1c', resultAdmission: '7.2 %', resultDischarge: '-', referenceRange: '< 6.5%' },
    { name: 'Serum Creatinine', resultAdmission: '0.9 mg/dL', resultDischarge: '0.8 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
    { name: 'PT/INR', resultAdmission: '1.0', resultDischarge: '1.1', referenceRange: '0.8 - 1.2' },
  ],
  'Pulmonology': [
    { name: 'Hemoglobin', resultAdmission: '14.2 g/dL', resultDischarge: '13.8 g/dL', referenceRange: '13 - 17 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '10,200 /cu.mm', resultDischarge: '8,100 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'ABG pH', resultAdmission: '7.28', resultDischarge: '7.38', referenceRange: '7.35 - 7.45' },
    { name: 'ABG pCO2', resultAdmission: '68 mmHg', resultDischarge: '48 mmHg', referenceRange: '35 - 45 mmHg' },
    { name: 'ABG pO2', resultAdmission: '52 mmHg', resultDischarge: '72 mmHg', referenceRange: '80 - 100 mmHg' },
    { name: 'CRP', resultAdmission: '45 mg/L', resultDischarge: '8 mg/L', referenceRange: '< 5 mg/L' },
    { name: 'Serum Sodium', resultAdmission: '136 mEq/L', resultDischarge: '141 mEq/L', referenceRange: '135 - 145 mEq/L' },
  ],
  'Gastroenterology': [
    { name: 'Hemoglobin', resultAdmission: '5.2 g/dL', resultDischarge: '8.1 g/dL', referenceRange: '13 - 17 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '9,800 /cu.mm', resultDischarge: '7,200 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'Platelet Count', resultAdmission: '1.8 lakh/cu.mm', resultDischarge: '2.2 lakh/cu.mm', referenceRange: '1.5 - 4.0 lakh' },
    { name: 'Serum Amylase', resultAdmission: '680 U/L', resultDischarge: '85 U/L', referenceRange: '28 - 100 U/L' },
    { name: 'Serum Lipase', resultAdmission: '920 U/L', resultDischarge: '62 U/L', referenceRange: '13 - 60 U/L' },
    { name: 'Total Bilirubin', resultAdmission: '2.8 mg/dL', resultDischarge: '1.2 mg/dL', referenceRange: '0.1 - 1.2 mg/dL' },
    { name: 'SGOT (AST)', resultAdmission: '86 U/L', resultDischarge: '42 U/L', referenceRange: '10 - 40 U/L' },
    { name: 'SGPT (ALT)', resultAdmission: '92 U/L', resultDischarge: '38 U/L', referenceRange: '7 - 56 U/L' },
    { name: 'INR', resultAdmission: '1.4', resultDischarge: '1.1', referenceRange: '0.8 - 1.2' },
    { name: 'Serum Albumin', resultAdmission: '2.8 g/dL', resultDischarge: '3.2 g/dL', referenceRange: '3.5 - 5.0 g/dL' },
  ],
  'Nephrology': [
    { name: 'Hemoglobin', resultAdmission: '9.2 g/dL', resultDischarge: '9.8 g/dL', referenceRange: '12 - 16 g/dL' },
    { name: 'Serum Creatinine', resultAdmission: '5.8 mg/dL', resultDischarge: '3.4 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
    { name: 'Blood Urea', resultAdmission: '128 mg/dL', resultDischarge: '68 mg/dL', referenceRange: '10 - 45 mg/dL' },
    { name: 'Serum Potassium', resultAdmission: '6.2 mEq/L', resultDischarge: '4.8 mEq/L', referenceRange: '3.5 - 5.1 mEq/L' },
    { name: 'Serum Sodium', resultAdmission: '128 mEq/L', resultDischarge: '137 mEq/L', referenceRange: '135 - 145 mEq/L' },
    { name: 'Serum Bicarbonate', resultAdmission: '14 mEq/L', resultDischarge: '20 mEq/L', referenceRange: '22 - 29 mEq/L' },
    { name: 'Serum Albumin', resultAdmission: '2.6 g/dL', resultDischarge: '2.9 g/dL', referenceRange: '3.5 - 5.0 g/dL' },
    { name: 'eGFR', resultAdmission: '12 mL/min', resultDischarge: '18 mL/min', referenceRange: '> 90 mL/min' },
  ],
  'Surgery': [
    { name: 'Hemoglobin', resultAdmission: '11.4 g/dL', resultDischarge: '10.8 g/dL', referenceRange: '13 - 17 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '15,600 /cu.mm', resultDischarge: '8,400 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'Serum Creatinine', resultAdmission: '1.2 mg/dL', resultDischarge: '1.0 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
    { name: 'Serum Amylase', resultAdmission: '420 U/L', resultDischarge: '72 U/L', referenceRange: '28 - 100 U/L' },
    { name: 'SGOT (AST)', resultAdmission: '52 U/L', resultDischarge: '32 U/L', referenceRange: '10 - 40 U/L' },
    { name: 'SGPT (ALT)', resultAdmission: '48 U/L', resultDischarge: '28 U/L', referenceRange: '7 - 56 U/L' },
    { name: 'PT/INR', resultAdmission: '1.1', resultDischarge: '1.0', referenceRange: '0.8 - 1.2' },
  ],
  'Endocrinology': [
    { name: 'Hemoglobin', resultAdmission: '10.8 g/dL', resultDischarge: '11.2 g/dL', referenceRange: '12 - 16 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '14,200 /cu.mm', resultDischarge: '8,800 /cu.mm', referenceRange: '4,000 - 11,000' },
    { name: 'Fasting Blood Sugar', resultAdmission: '286 mg/dL', resultDischarge: '142 mg/dL', referenceRange: '70 - 100 mg/dL' },
    { name: 'Post-prandial Blood Sugar', resultAdmission: '382 mg/dL', resultDischarge: '186 mg/dL', referenceRange: '< 140 mg/dL' },
    { name: 'HbA1c', resultAdmission: '11.2 %', resultDischarge: '-', referenceRange: '< 6.5%' },
    { name: 'CRP', resultAdmission: '86 mg/L', resultDischarge: '14 mg/L', referenceRange: '< 5 mg/L' },
    { name: 'Serum Creatinine', resultAdmission: '1.6 mg/dL', resultDischarge: '1.3 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
  ],
  'Pediatrics': [
    { name: 'Hemoglobin', resultAdmission: '11.6 g/dL', resultDischarge: '11.8 g/dL', referenceRange: '11.5 - 15.5 g/dL' },
    { name: 'Total WBC Count', resultAdmission: '4,200 /cu.mm', resultDischarge: '6,800 /cu.mm', referenceRange: '5,000 - 14,500' },
    { name: 'Platelet Count', resultAdmission: '85,000 /cu.mm', resultDischarge: '1.6 lakh/cu.mm', referenceRange: '1.5 - 4.0 lakh' },
    { name: 'Haematocrit', resultAdmission: '42 %', resultDischarge: '38 %', referenceRange: '35 - 45%' },
    { name: 'SGOT (AST)', resultAdmission: '128 U/L', resultDischarge: '52 U/L', referenceRange: '10 - 40 U/L' },
    { name: 'SGPT (ALT)', resultAdmission: '96 U/L', resultDischarge: '48 U/L', referenceRange: '7 - 56 U/L' },
  ],
};

/** Default lab results for departments not in LAB_PRESETS */
const DEFAULT_LABS = [
  { name: 'Hemoglobin', resultAdmission: '11.5 g/dL', resultDischarge: '12.0 g/dL', referenceRange: '13 - 17 g/dL' },
  { name: 'Total WBC Count', resultAdmission: '10,400 /cu.mm', resultDischarge: '7,800 /cu.mm', referenceRange: '4,000 - 11,000' },
  { name: 'Serum Creatinine', resultAdmission: '1.2 mg/dL', resultDischarge: '1.0 mg/dL', referenceRange: '0.7 - 1.3 mg/dL' },
  { name: 'Random Blood Sugar', resultAdmission: '146 mg/dL', resultDischarge: '108 mg/dL', referenceRange: '70 - 140 mg/dL' },
  { name: 'Serum Sodium', resultAdmission: '136 mEq/L', resultDischarge: '140 mEq/L', referenceRange: '135 - 145 mEq/L' },
  { name: 'Serum Potassium', resultAdmission: '4.0 mEq/L', resultDischarge: '4.2 mEq/L', referenceRange: '3.5 - 5.1 mEq/L' },
];

function parseInvestigationsForRecord(rec) {
  return LAB_PRESETS[rec.department] || DEFAULT_LABS;
}

/** Imaging report presets by department for seed data */
const IMAGING_BY_DEPT = {
  'Cardiology': 'Chest X-Ray (PA View): Cardiomegaly with cardiothoracic ratio of 58%. Pulmonary venous congestion and Kerley B lines suggestive of interstitial edema. Bilateral costophrenic angles blunted.\nElectrocardiogram (ECG): Sinus tachycardia, Left Axis Deviation, Left Ventricular Hypertrophy with strain pattern.\n2D Echocardiography: Dilated LV with global hypokinesia. LVEF 35%. Moderate Mitral Regurgitation. Grade II Diastolic Dysfunction.',
  'Neurology': 'CT Brain (Plain): Early ischaemic changes in left MCA territory. No hemorrhage.\nMRI Brain with DWI: Acute infarct in left MCA territory confirmed. No midline shift.\nCarotid Doppler: Mild intimal thickening bilaterally. No significant stenosis.\nECG: Normal sinus rhythm.',
  'General Medicine': 'Chest X-Ray: Right lower zone consolidation with air bronchograms consistent with pneumonia.\nCT Chest: Right lower lobe consolidation with small parapneumonic effusion.\nUSG Abdomen: Normal study.',
  'Orthopedics': 'X-Ray Hip (AP/Lateral): Intertrochanteric fracture right femur, undisplaced.\nCT Hip: Confirms fracture geometry, suitable for dynamic hip screw fixation.\nChest X-Ray: Normal cardiac silhouette, clear lung fields.\nDoppler Lower Limbs (Post-op): No deep vein thrombosis.',
  'Pulmonology': 'Chest X-Ray: Hyperinflated lung fields with flattened diaphragm. No consolidation.\nECG: Right axis deviation, P pulmonale.\nCT Chest: Emphysematous changes. No pulmonary embolism.',
  'Endocrinology': 'X-Ray Foot: Osteomyelitis of left calcaneum with soft tissue swelling.\nMRI Foot: Marrow edema in calcaneum consistent with osteomyelitis. Surrounding cellulitis.\nDoppler Lower Limbs: Reduced flow in left dorsalis pedis artery.',
  'Gastroenterology': 'USG Abdomen: Gallstones noted. No CBD dilatation. Mild hepatomegaly.\nCECT Abdomen: Acute pancreatitis with peripancreatic fat stranding. No necrosis (Balthazar Grade C).\nMRCP: Gallstones in gallbladder. CBD normal calibre.',
  'Nephrology': 'USG Abdomen: Bilateral kidneys normal in size with maintained corticomedullary differentiation. Mild ascites.\nChest X-Ray: Bilateral pleural effusion (small). Cardiothoracic ratio at upper limit of normal.\nECG: Sinus rhythm. Peaked T waves noted (corrected after treatment).',
  'Surgery': 'Erect X-Ray Abdomen: Free gas under diaphragm (pneumoperitoneum) consistent with hollow viscus perforation.\nUSG Abdomen: Free fluid in peritoneal cavity. No organomegaly.',
  'Pediatrics': 'USG Abdomen: Mild hepatomegaly. No ascites. No pleural effusion.\nChest X-Ray: Normal cardiac silhouette. Clear lung fields.',
  'Cardiothoracic Surgery': 'CT Aortogram: Stanford Type A aortic dissection from aortic root to arch. Aortic regurgitation.\nECG: Sinus tachycardia. No ST changes.\n2D Echocardiography: Severe aortic regurgitation. Dilated aortic root (52 mm). LVEF 50%.',
  'Vascular Surgery': 'CT Angiogram Lower Limb: Occlusion of right popliteal artery with no distal flow. Collateral circulation poor.\nDoppler Arterial: Absent flow in right popliteal, dorsalis pedis, and posterior tibial arteries.\n2D Echo: Dilated left atrium. Atrial fibrillation. No intracardiac thrombus.',
  'Critical Care': 'Chest X-Ray: Bilateral diffuse infiltrates consistent with ARDS.\nCT Chest: Ground glass opacities bilaterally. No pleural effusion.\n2D Echocardiography: Normal LV function. LVEF 55%. No pericardial effusion.',
};

/** Significant findings presets by department for seed data */
const SIGNIFICANT_FINDINGS_BY_DEPT = {
  'Cardiology': 'Systemic Review: The patient is a known diabetic and hypertensive for the past 8 years. Previously on oral hypoglycemic agents but had stopped them 3 months ago. CNS within normal limits. Abdominal examination showed mild tenderness in the right hypochondrium (congestive hepatomegaly).\nVital Signs Summary: Throughout the hospital stay, blood pressure fluctuated between 130/80 and 160/100 mmHg. Post-diuretic therapy, heart rate stabilized around 74-80/min. SpO2 improved from 90% (Admission) to 99% (Discharge) on room air.',
  'Neurology': 'Systemic Review: Known hypertensive on irregular medication. No prior history of stroke or TIA. Power improved from 2/5 to 3/5 in right upper and lower limbs during admission. Speech improved from severely slurred to intelligible.\nVital Signs Summary: BP ranged from 140/90 to 170/100 mmHg. Controlled to target <140/90 with antihypertensives.',
  'General Medicine': 'Systemic Review: No known comorbidities. Non-smoker. No recent travel history. Blood culture later grew Streptococcus pneumoniae (sensitive to Ceftriaxone).\nVital Signs Summary: Temperature normalised by day 4. SpO2 improved from 88% to 98% on room air. Heart rate and BP stabilised by day 3.',
  'Surgery': 'Systemic Review: Known history of NSAID use for chronic back pain. No prior history of peptic ulcer disease. H. pylori status positive.\nVital Signs Summary: Post-operative vitals stabilised within 24 hours. Afebrile from day 3. Bowel sounds returned by day 2.',
};

/** Parse procedures string into array of procedure objects */
function parseProceduresForRecord(rec) {
  const procStr = rec.procedures;
  if (!procStr || !String(procStr).trim()) return [];
  const items = String(procStr).split(/\.\s*/).filter(Boolean);
  return items.map((item) => ({
    date: null,
    name: item.trim().replace(/\.$/, ''),
    indicationOutcome: null,
  }));
}

/** Medical device presets for departments that commonly use implants */
const MEDICAL_DEVICES_BY_DEPT = {
  'Cardiology': [{ deviceType: 'Drug Eluting Stent (DES)', model: 'Xience Pro / SN-pending', location: 'LAD - Proximal/Mid Segment', implantDate: null }],
  'Cardiothoracic Surgery': [{ deviceType: 'Mechanical Aortic Valve + Composite Graft', model: 'St. Jude Medical / SN-pending', location: 'Aortic Root', implantDate: null }],
  'Orthopedics': [{ deviceType: 'Dynamic Hip Screw (DHS)', model: 'Synthes DHS / SN-pending', location: 'Right Proximal Femur', implantDate: null }],
};

/**
 * Build aiEnhancedJson (structured discharge JSON) from a seed record.
 * Matches backend dischargeJsonSchema for seeded AI_ENHANCED+ records.
 */
export function getAiEnhancedJsonForRecord(rec) {
  const medications = parseMedicationsString(rec.medications || '');
  const investigations = parseInvestigationsForRecord(rec);
  const procedures = parseProceduresForRecord(rec);
  const medicalDevices = MEDICAL_DEVICES_BY_DEPT[rec.department] || [];
  // Set implant date to admission date for devices
  if (medicalDevices.length > 0 && rec.admissionDate) {
    medicalDevices.forEach((dev) => { if (!dev.implantDate) dev.implantDate = rec.admissionDate; });
  }
  return {
    patient: {
      uhid: rec.uhid || null,
      ipid: rec.ipid || null,
      name: rec.patientName || null,
      age: rec.age || null,
      gender: rec.gender || null,
      mobile: rec.mobile || null,
      address: rec.address || null,
    },
    admission: {
      admissionDate: rec.admissionDate || null,
      dischargeDate: rec.dischargeDate || null,
      department: rec.department || null,
      dischargeCondition: rec.dischargeCondition || null,
      consultant: rec.consultant || null,
      wardBed: rec.wardBed || null,
    },
    diagnoses: {
      provisional: rec.provisionalDiagnosis || null,
      final: rec.finalDiagnosis || null,
      icd10Codes: Array.isArray(rec.icd10Codes) ? rec.icd10Codes : [rec.icd10Codes].filter(Boolean),
    },
    reasonForAdmission: rec.reasonForAdmission || null,
    clinicalExamination: rec.clinicalExamination || null,
    significantFindings: SIGNIFICANT_FINDINGS_BY_DEPT[rec.department] || null,
    hospitalCourse: rec.courseInHospital || null,
    procedures,
    investigations,
    imagingReports: IMAGING_BY_DEPT[rec.department] || null,
    medicalDevices,
    medications,
    instructions: {
      diet: null,
      activity: null,
      woundCare: null,
      followUp: rec.followUp || null,
      redFlags: rec.redFlags || null,
      advice: rec.advice || null,
    },
    missingFields: [],
    warnings: [],
    finalNarrativeText: [
      rec.patientName && `Summary: ${rec.patientName} (${rec.uhid}) was admitted under ${rec.department} with ${rec.provisionalDiagnosis}.`,
      rec.finalDiagnosis && `Final diagnosis: ${rec.finalDiagnosis}.`,
      rec.courseInHospital && rec.courseInHospital.slice(0, 200) + (rec.courseInHospital.length > 200 ? '...' : ''),
    ].filter(Boolean).join(' '),
  };
}
