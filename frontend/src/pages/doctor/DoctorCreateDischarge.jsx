import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Accordion,
  Card,
  Form,
  Button,
  ProgressBar,
  Row,
  Col,
} from 'react-bootstrap';
import { SubmitButton } from '../../components/SubmitButton';
import { ChipsInput } from '../../components/ChipsInput';
import { PageHeader } from '../../components/PageHeader';
import { useToast } from '../../components/ToastProvider';
import {
  createDraft,
  saveDraft,
  getDischarge,
  generateAIDraft,
  submitForApproval,
} from '../../api/dischargeApi';
import { dischargeFormSchema, defaultDischargeValues } from './dischargeSchema';

const SECTION_KEYS = [
  'patientProfile',
  'admissionDetails',
  'diagnosis',
  'clinicalSummary',
  'investigations',
  'discharge',
];
const TOTAL_SECTIONS = SECTION_KEYS.length;

function useDebouncedSave(dischargeId, getValues, enabled) {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  const persist = useCallback(
    async (payload) => {
      if (!dischargeId) return;
      try {
        await saveDraft(dischargeId, payload);
        lastSavedRef.current = new Date();
      } catch (_) {}
    },
    [dischargeId]
  );

  const scheduleSave = useCallback(
    (delay = 1000) => {
      if (!enabled || !dischargeId) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const values = getValues();
        persist(values);
        timeoutRef.current = null;
      }, delay);
    },
    [dischargeId, enabled, getValues, persist]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { scheduleSave, lastSavedRef };
}

export function DoctorCreateDischarge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const toast = useToast();
  const [loadingDraft, setLoadingDraft] = useState(false);

  const methods = useForm({
    defaultValues: defaultDischargeValues,
    resolver: yupResolver(dischargeFormSchema),
    mode: 'onBlur',
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const [dischargeId, setDischargeId] = useState(editId || null);
  const [savedAt, setSavedAt] = useState(null);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const { scheduleSave, lastSavedRef } = useDebouncedSave(
    dischargeId,
    getValues,
    true
  );

  useEffect(() => {
    if (editId) {
      setDischargeId(editId);
      setLoadingDraft(true);
      getDischarge(editId)
        .then((d) => {
          if (d) {
            Object.keys(defaultDischargeValues).forEach((key) => {
              if (d[key] !== undefined) setValue(key, d[key] ?? defaultDischargeValues[key]);
            });
            setAiEnhanced(!!d.aiEnhancedText);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDraft(false));
    }
  }, [editId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsubscribe = watch(() => scheduleSave(1000));
    return () => (typeof unsubscribe === 'function' ? unsubscribe() : undefined);
  }, [watch, scheduleSave]);

  useEffect(() => {
    const t = setInterval(() => {
      if (lastSavedRef.current) setSavedAt(lastSavedRef.current);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const onSaveDraft = useCallback(
    async (values) => {
      setSavingDraft(true);
      try {
        if (dischargeId) {
          await saveDraft(dischargeId, values);
          lastSavedRef.current = new Date();
          setSavedAt(lastSavedRef.current);
          toast.success('Draft saved');
          return;
        }
        const created = await createDraft(values);
        const id = created._id || created.id;
        setDischargeId(id);
        await saveDraft(id, values);
        lastSavedRef.current = new Date();
        setSavedAt(lastSavedRef.current);
        toast.success('Draft created and saved');
        navigate(`/doctor/create?id=${id}`, { replace: true });
      } catch (_e) {
        /* error handled silently */
      } finally {
        setSavingDraft(false);
      }
    },
    [dischargeId, navigate, toast, lastSavedRef]
  );

  const onGenerateAI = useCallback(() => {
    if (!dischargeId) {
      toast.warning('Save draft first');
      return;
    }
    setGeneratingAI(true);
    generateAIDraft(dischargeId)
      .then(() => {
        setAiEnhanced(true);
        toast.success('AI draft generated');
        navigate(`/doctor/preview/${dischargeId}`);
      })
      .catch(() => {})
      .finally(() => setGeneratingAI(false));
  }, [dischargeId, navigate, toast]);

  const onSubmitForApproval = useCallback(() => {
    if (!dischargeId) {
      toast.warning('Save draft first');
      return;
    }
    handleSubmit(async (values) => {
      setSubmittingApproval(true);
      try {
        await submitForApproval(dischargeId, values);
        toast.success('Submitted for approval');
        navigate('/doctor');
      } catch (_e) {
        /* error handled silently */
      } finally {
        setSubmittingApproval(false);
      }
    })();
  }, [dischargeId, handleSubmit, navigate, toast]);

  const completedSections = SECTION_KEYS.filter((key) => {
    const v = getValues();
    if (key === 'patientProfile') return v.uhid && v.ipid && v.mobile;
    if (key === 'admissionDetails') return true;
    if (key === 'diagnosis') return true;
    if (key === 'clinicalSummary') return true;
    if (key === 'investigations') return true;
    if (key === 'discharge') return true;
    return true;
  }).length;
  const progress = Math.round((completedSections / TOTAL_SECTIONS) * 100);

  if (editId && loadingDraft) {
    return (
      <div className="ds-page-enter ds-page-enter-active">
        <p className="text-muted">Loading draft...</p>
      </div>
    );
  }

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/doctor', label: 'My Summaries' }, { label: 'Create' }]}
        title="Create Discharge Summary"
        description="Fill all sections, then: Save draft → Generate AI draft → Preview & submit for approval."
        action={
          <>
            {savedAt && (
              <span className="text-muted small me-2" role="status">
                Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
            <Button as={Link} to="/doctor" variant="outline-secondary" size="sm" className="ds-focus-ring">
              ← Back
            </Button>
          </>
        }
      />
      <div className="mb-3">
        <ProgressBar now={progress} label={`${progress}%`} className="mb-0" style={{ height: 8 }} />
        <small className="text-muted">Sections completed</small>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSaveDraft)} noValidate>
          <Accordion defaultActiveKey="patientProfile" className="mb-5">
            {/* 1) Patient Profile — matches template "Patient Profile" */}
            <Accordion.Item eventKey="patientProfile" className="ds-card border rounded-3 overflow-hidden mb-2">
              <Accordion.Header>
                <span className="me-2">👤</span> Patient Profile
              </Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control {...register('patientName')} placeholder="Patient name" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>UHID <span className="text-danger">*</span></Form.Label>
                      <Form.Control {...register('uhid')} isInvalid={!!errors.uhid} placeholder="e.g. UH000124" className="ds-focus-ring" aria-required="true" />
                      <Form.Control.Feedback type="invalid">{errors.uhid?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>IP No <span className="text-danger">*</span></Form.Label>
                      <Form.Control {...register('ipid')} isInvalid={!!errors.ipid} placeholder="e.g. IP000562" className="ds-focus-ring" aria-required="true" />
                      <Form.Control.Feedback type="invalid">{errors.ipid?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Age / Gender</Form.Label>
                      <Form.Control {...register('age')} placeholder="e.g. 58 Years" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Gender</Form.Label>
                      <Form.Select {...register('gender')} className="ds-focus-ring">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control {...register('address')} placeholder="e.g. No 45, Gandhi Road, Melmaruvathur, TN" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Mobile <span className="text-danger">*</span></Form.Label>
                      <Form.Control {...register('mobile')} isInvalid={!!errors.mobile} placeholder="10-digit mobile" className="ds-focus-ring" aria-required="true" />
                      <Form.Control.Feedback type="invalid">{errors.mobile?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* 2) Admission Details — matches template "Admission Details" */}
            <Accordion.Item eventKey="admissionDetails" className="ds-card border rounded-3 overflow-hidden mb-2">
              <Accordion.Header>
                <span className="me-2">📅</span> Admission Details
              </Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Admission Date</Form.Label>
                      <Form.Control {...register('admissionDate')} type="date" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Discharge Date</Form.Label>
                      <Form.Control {...register('dischargeDate')} type="date" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Consultant</Form.Label>
                      <Form.Control {...register('consultant')} placeholder="e.g. Dr. P. Arumugam, MD (Cardiology)" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Ward / Bed</Form.Label>
                      <Form.Control {...register('wardBed')} placeholder="e.g. Cardiac Care Unit / Bed 201" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Control {...register('department')} placeholder="e.g. Cardiology, General Medicine" className="ds-focus-ring" />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* 3) Final Diagnosis — matches template "Final Diagnosis" */}
            <Accordion.Item eventKey="diagnosis" className="ds-card border rounded-3 overflow-hidden mb-2">
              <Accordion.Header>
                <span className="me-2">🩺</span> Final Diagnosis
              </Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Diagnosis</Form.Label>
                  <Form.Control {...register('finalDiagnosis')} as="textarea" rows={2} placeholder="Final / primary diagnosis" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Provisional / Secondary Diagnoses</Form.Label>
                  <Form.Control {...register('provisionalDiagnosis')} as="textarea" rows={2} placeholder="Provisional or secondary diagnoses" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>ICD-10 codes</Form.Label>
                  <Controller
                    name="icd10Codes"
                    control={control}
                    render={({ field }) => (
                      <ChipsInput value={field.value} onChange={field.onChange} placeholder="e.g. I10, E11.9 — press Enter or Add" ariaLabel="ICD-10 codes" />
                    )}
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            {/* 4) Clinical Summary & Hospital Course — matches template "Clinical Summary" and "Hospital Course & Care Provided" */}
            <Accordion.Item eventKey="clinicalSummary" className="ds-card border rounded-3 overflow-hidden mb-2">
              <Accordion.Header>
                <span className="me-2">📋</span> Clinical Summary &amp; Hospital Course
              </Accordion.Header>
              <Accordion.Body>
                <Form.Group>
                  <Form.Label>Reason for admission, examination findings &amp; hospital course</Form.Label>
                  <Form.Control
                    {...register('courseInHospital')}
                    as="textarea"
                    rows={5}
                    placeholder="Reason for admission, clinical examination, significant findings, vital signs summary, and hospital course & care provided."
                    className="ds-focus-ring"
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            {/* 5) Laboratory Investigations & Procedures — matches template "Laboratory Investigations" and "Procedures Performed" */}
            <Accordion.Item eventKey="investigations" className="ds-card border rounded-3 overflow-hidden mb-2">
              <Accordion.Header>
                <span className="me-2">🔬</span> Laboratory Investigations &amp; Procedures
              </Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Laboratory Investigations</Form.Label>
                  <Form.Control {...register('investigations')} as="textarea" rows={3} placeholder="Lab results, imaging & diagnostic reports" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Treatment given</Form.Label>
                  <Form.Control {...register('treatment')} as="textarea" rows={2} placeholder="Treatment during stay" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Procedures Performed</Form.Label>
                  <Form.Control {...register('procedures')} as="textarea" rows={2} placeholder="Date, procedure name, indication & outcome" className="ds-focus-ring" />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            {/* 6) Post-Discharge Instructions — matches template "Condition at Discharge", "Discharge Medications", "Follow-up", "Warning Signs", "Dietary and Activity" */}
            <Accordion.Item eventKey="discharge" className="ds-card border rounded-3 overflow-hidden mb-2">
              <Accordion.Header>
                <span className="me-2">✅</span> Condition at Discharge &amp; Post-Discharge Instructions
              </Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Condition at Discharge</Form.Label>
                  <Form.Control {...register('dischargeCondition')} as="textarea" rows={2} placeholder="Clinical status at discharge" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Discharge Medications</Form.Label>
                  <Form.Control {...register('medications')} as="textarea" rows={3} placeholder="Medication name, dosage, frequency, duration, instructions" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Follow-up Advice</Form.Label>
                  <Form.Control {...register('followUp')} as="textarea" rows={2} placeholder="OPD date, department, instructions" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Urgent Care Instructions (Warning Signs)</Form.Label>
                  <Form.Control {...register('redFlags')} as="textarea" rows={2} placeholder="When to contact hospital or visit Emergency" className="ds-focus-ring" />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Dietary and Activity Advice</Form.Label>
                  <Form.Control {...register('advice')} as="textarea" rows={2} placeholder="Salt, fluids, activity, weight monitoring, etc." className="ds-focus-ring" />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Sticky action bar */}
          <div
            className="position-sticky bottom-0 py-3 px-0 mx-n3 mx-md-n4 mb-n3 mb-md-n4 px-3 px-md-4 rounded-top shadow"
            style={{
              backgroundColor: 'var(--ds-bg-elevated)',
              borderTop: '1px solid var(--ds-border-subtle)',
            }}
          >
            <div className="d-flex flex-wrap align-items-center gap-2">
              <SubmitButton
                type="submit"
                loading={savingDraft}
                variant="primary"
              >
                Save Draft
              </SubmitButton>
              <SubmitButton
                type="button"
                variant="outline-info"
                onClick={onGenerateAI}
                disabled={!dischargeId}
                loading={generatingAI}
              >
                Generate AI Draft
              </SubmitButton>
              <SubmitButton
                type="button"
                variant="success"
                onClick={onSubmitForApproval}
                disabled={!dischargeId}
                loading={submittingApproval}
              >
                Submit for Approval
              </SubmitButton>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

