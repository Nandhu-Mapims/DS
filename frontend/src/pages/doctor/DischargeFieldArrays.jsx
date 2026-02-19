import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';

export const LabResultsArray = () => {
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'labResults',
    });

    return (
        <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label className="mb-0 fw-semibold text-primary">🔬 Laboratory Investigations (Structured)</Form.Label>
                <Button
                    variant="link"
                    size="sm"
                    className="text-decoration-none"
                    onClick={() => append({ investigation: '', resultAdmission: '', resultDischarge: '', referenceRange: '' })}
                >
                    + Add Row
                </Button>
            </div>

            {fields.length > 0 ? (
                <div className="table-responsive rounded border shadow-sm">
                    <Table bordered hover size="sm" className="mb-0 bg-white">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th style={{ width: '30%' }}>Investigation</th>
                                <th>Result (Adm)</th>
                                <th>Result (Disch)</th>
                                <th>Ref. Range</th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody className="align-middle">
                            {fields.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="p-2">
                                        <Form.Control
                                            {...register(`labResults.${index}.investigation`)}
                                            size="sm"
                                            placeholder="e.g. Hemoglobin"
                                            className="border-0 bg-transparent fw-medium"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`labResults.${index}.resultAdmission`)} size="sm" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`labResults.${index}.resultDischarge`)} size="sm" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`labResults.${index}.referenceRange`)} size="sm" className="border-0 bg-transparent text-muted" />
                                    </td>
                                    <td className="text-center p-2">
                                        <Button variant="link" className="text-danger p-0 opacity-50 hover-opacity-100" size="sm" onClick={() => remove(index)} title="Remove">✕</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="text-center p-4 border rounded border-dashed bg-light">
                    <p className="text-muted small mb-2">No structured lab results added.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => append({ investigation: '', resultAdmission: '', resultDischarge: '', referenceRange: '' })}
                    >
                        + Add Lab Result
                    </Button>
                </div>
            )}
        </div>
    );
};

export const ProceduresArray = () => {
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'procedureList',
    });

    return (
        <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label className="mb-0 fw-semibold text-primary">🏥 Procedures Performed</Form.Label>
                {fields.length > 0 && (
                    <Button
                        variant="link"
                        size="sm"
                        className="text-decoration-none"
                        onClick={() => append({ date: '', name: '', indicationOutcome: '' })}
                    >
                        + Add Row
                    </Button>
                )}
            </div>

            {fields.length > 0 ? (
                <div className="table-responsive rounded border shadow-sm">
                    <Table bordered hover size="sm" className="mb-0 bg-white">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th style={{ width: '150px' }}>Date</th>
                                <th style={{ width: '30%' }}>Procedure Name</th>
                                <th>Indication & Outcome</th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody className="align-middle">
                            {fields.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="p-2">
                                        <Form.Control {...register(`procedureList.${index}.date`)} type="date" size="sm" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control
                                            {...register(`procedureList.${index}.name`)}
                                            size="sm"
                                            placeholder="Procedure Name"
                                            className="border-0 bg-transparent fw-medium"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control
                                            {...register(`procedureList.${index}.indicationOutcome`)}
                                            size="sm"
                                            placeholder="Indication/Outcome"
                                            className="border-0 bg-transparent"
                                        />
                                    </td>
                                    <td className="text-center p-2">
                                        <Button variant="link" className="text-danger p-0 opacity-50 hover-opacity-100" size="sm" onClick={() => remove(index)} title="Remove">✕</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="text-center p-3 border rounded border-dashed bg-light">
                    <p className="text-muted small mb-2">No procedures logged.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => append({ date: '', name: '', indicationOutcome: '' })}
                    >
                        + Add Procedure (If Applicable)
                    </Button>
                </div>
            )}
        </div>
    );
};

export const DevicesArray = () => {
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'deviceList',
    });

    return (
        <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label className="mb-0 fw-semibold text-primary">⚙️ Medical Devices / Implants</Form.Label>
                {fields.length > 0 && (
                    <Button
                        variant="link"
                        size="sm"
                        className="text-decoration-none"
                        onClick={() => append({ deviceType: '', model: '', location: '', implantDate: '' })}
                    >
                        + Add Row
                    </Button>
                )}
            </div>

            {fields.length > 0 ? (
                <div className="table-responsive rounded border shadow-sm">
                    <Table bordered hover size="sm" className="mb-0 bg-white">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th style={{ width: '25%' }}>Device Type</th>
                                <th>Model / Serial No.</th>
                                <th>Location</th>
                                <th>Implant Date</th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody className="align-middle">
                            {fields.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="p-2">
                                        <Form.Control {...register(`deviceList.${index}.deviceType`)} size="sm" placeholder="e.g. Stent" className="border-0 bg-transparent fw-medium" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`deviceList.${index}.model`)} size="sm" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`deviceList.${index}.location`)} size="sm" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`deviceList.${index}.implantDate`)} type="date" size="sm" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="text-center p-2">
                                        <Button variant="link" className="text-danger p-0 opacity-50 hover-opacity-100" size="sm" onClick={() => remove(index)} title="Remove">✕</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="text-center p-3 border rounded border-dashed bg-light">
                    <p className="text-muted small mb-2">No implants or devices.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => append({ deviceType: '', model: '', location: '', implantDate: '' })}
                    >
                        + Add Device (If Applicable)
                    </Button>
                </div>
            )}
        </div>
    );
};

export const MedicationsArray = () => {
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'medicationList',
    });

    return (
        <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <Form.Label className="mb-0 fw-semibold text-primary">💊 Discharge Medications (Structured)</Form.Label>
                <Button
                    variant="link"
                    size="sm"
                    className="text-decoration-none"
                    onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
                >
                    + Add Row
                </Button>
            </div>

            {fields.length > 0 ? (
                <div className="table-responsive rounded border shadow-sm">
                    <Table bordered hover size="sm" className="mb-0 bg-white">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th style={{ width: '30%' }}>Medication Name</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Instructions</th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody className="align-middle">
                            {fields.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="p-2">
                                        <Form.Control {...register(`medicationList.${index}.name`)} size="sm" placeholder="Drug Name" className="border-0 bg-transparent fw-medium" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`medicationList.${index}.dosage`)} size="sm" placeholder="e.g. 500mg" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`medicationList.${index}.frequency`)} size="sm" placeholder="1-0-1" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`medicationList.${index}.duration`)} size="sm" placeholder="5 days" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="p-2">
                                        <Form.Control {...register(`medicationList.${index}.instructions`)} size="sm" placeholder="e.g. After food" className="border-0 bg-transparent" />
                                    </td>
                                    <td className="text-center p-2">
                                        <Button variant="link" className="text-danger p-0 opacity-50 hover-opacity-100" size="sm" onClick={() => remove(index)} title="Remove">✕</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="text-center p-4 border rounded border-dashed bg-light">
                    <p className="text-muted small mb-2">No medications added.</p>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
                    >
                        + Add Medication
                    </Button>
                </div>
            )}
        </div>
    );
};
