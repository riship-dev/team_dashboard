import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './EmployeeFormModal.css';

const FUNCTIONAL_AREAS = [
    { id: 1, name: 'Development' },
    { id: 2, name: 'Data Analytics' },
    { id: 3, name: 'Design' },
    { id: 4, name: 'Consultancy' },
    { id: 5, name: 'Documentation' },
];

const DEFAULT_FORM = {
    emp_id: '',
    emp_name: '',
    designation: '',
    years_of_exp: '',
    graduation_deg: '',
    projects_completed: '',
    areas: [],
};

export default function EmployeeFormModal({ employee, onClose, onSaved }) {
    const isEdit = Boolean(employee);

    const [form, setForm] = useState(DEFAULT_FORM);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ── Populate form when editing ───────────────────────────────────────
    useEffect(() => {
        if (employee) {
            setForm({
                emp_id:              employee.emp_id,
                emp_name:            employee.emp_name,
                designation:         employee.designation,
                years_of_exp:        employee.years_of_exp,
                graduation_deg:      employee.graduation_deg,
                projects_completed:  employee.projects_completed,
                areas:               employee.areas.map((a) => ({
                    functional_area_id: a.functional_area_id,
                    rating:             parseFloat(a.rating),
                })),
            });
        } else {
            setForm(DEFAULT_FORM);
        }
    }, [employee]);

    // ── Field change ─────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ── Area checkbox toggle ─────────────────────────────────────────────
    const handleAreaToggle = (areaId) => {
        setForm((prev) => {
            const exists = prev.areas.find((a) => a.functional_area_id === areaId);
            if (exists) {
                return {
                    ...prev,
                    areas: prev.areas.filter((a) => a.functional_area_id !== areaId),
                };
            }
            return {
                ...prev,
                areas: [...prev.areas, { functional_area_id: areaId, rating: 5 }],
            };
        });
    };

    // ── Rating change ────────────────────────────────────────────────────
    const handleRatingChange = (areaId, value) => {
        setForm((prev) => ({
            ...prev,
            areas: prev.areas.map((a) =>
                a.functional_area_id === areaId
                    ? { ...a, rating: parseFloat(value) }
                    : a
            ),
        }));
    };

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.areas.length === 0) {
            setError('Please select at least one functional area.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                emp_name:            form.emp_name,
                designation:         form.designation,
                years_of_exp:        parseInt(form.years_of_exp),
                graduation_deg:      form.graduation_deg,
                projects_completed:  parseInt(form.projects_completed),
                areas:               form.areas,
            };

            if (isEdit) {
                await api.put(`/employees/${form.emp_id}`, payload);
            } else {
                await api.post('/employees', {
                    emp_id: parseInt(form.emp_id),
                    ...payload,
                });
            }

            onSaved();
            onClose();

        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── Header ──────────────────────────────────────────── */}
                <div className="modal-header-bar">
                    <h5>{isEdit ? 'Edit Employee' : 'Add New Employee'}</h5>
                    <button className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* ── Error ───────────────────────────────────────────── */}
                {error && (
                    <div className="alert alert-danger py-2 mb-3 text-center">
                        {error}
                    </div>
                )}

                {/* ── Form ────────────────────────────────────────────── */}
                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        {/* Employee ID — only for Add */}
                        {!isEdit && (
                            <div className="form-group">
                                <label>Employee ID</label>
                                <input
                                    type="number"
                                    name="emp_id"
                                    className="form-control"
                                    placeholder="e.g. 1002"
                                    value={form.emp_id}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="emp_name"
                                className="form-control"
                                placeholder="e.g. Jane Smith"
                                value={form.emp_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Designation</label>
                            <input
                                type="text"
                                name="designation"
                                className="form-control"
                                placeholder="e.g. Data Scientist"
                                value={form.designation}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Years of Experience</label>
                            <input
                                type="number"
                                name="years_of_exp"
                                className="form-control"
                                placeholder="e.g. 4"
                                min="0"
                                value={form.years_of_exp}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Graduation Degree</label>
                            <input
                                type="text"
                                name="graduation_deg"
                                className="form-control"
                                placeholder="e.g. B.Sc Computer Science"
                                value={form.graduation_deg}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Projects Completed</label>
                            <input
                                type="number"
                                name="projects_completed"
                                className="form-control"
                                placeholder="e.g. 12"
                                min="0"
                                value={form.projects_completed}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    {/* ── Functional Areas ────────────────────────────── */}
                    <div className="areas-section">
                        <label className="areas-label">
                            Functional Areas & Ratings
                        </label>
                        <p className="areas-hint">
                            Select areas and set a rating from 0 to 10
                        </p>

                        <div className="areas-list">
                            {FUNCTIONAL_AREAS.map((area) => {
                                const selected = form.areas.find(
                                    (a) => a.functional_area_id === area.id
                                );
                                return (
                                    <div
                                        key={area.id}
                                        className={`area-row ${selected ? 'area-row--active' : ''}`}
                                    >
                                        <div className="area-row-left">
                                            <input
                                                type="checkbox"
                                                id={`area-${area.id}`}
                                                checked={Boolean(selected)}
                                                onChange={() => handleAreaToggle(area.id)}
                                            />
                                            <label htmlFor={`area-${area.id}`}>
                                                {area.name}
                                            </label>
                                        </div>

                                        {selected && (
                                            <div className="area-row-right">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    step="0.5"
                                                    value={selected.rating}
                                                    onChange={(e) =>
                                                        handleRatingChange(area.id, e.target.value)
                                                    }
                                                />
                                                <span className="rating-value">
                                                    {selected.rating}/10
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Footer ──────────────────────────────────────── */}
                    <div className="modal-footer-bar">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Add Employee'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}