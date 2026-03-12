import React, { useState } from 'react';
import api from '../api/axios';
import './DeleteConfirmModal.css';

export default function DeleteConfirmModal({ employee, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');
        try {
            await api.delete(`/employees/${employee.emp_id}`);
            onDeleted();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete employee.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="delete-modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="delete-modal-icon">🗑️</div>

                <h5 className="delete-modal-title">Delete Employee</h5>

                <p className="delete-modal-message">
                    Are you sure you want to delete{' '}
                    <strong>{employee.emp_name}</strong> (ID: {employee.emp_id})?
                    <br />
                    <span className="delete-modal-warning">
                        This action cannot be undone.
                    </span>
                </p>

                {error && (
                    <div className="alert alert-danger py-2 text-center mb-3">
                        {error}
                    </div>
                )}

                <div className="delete-modal-footer">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Deleting...
                            </>
                        ) : (
                            'Yes, Delete'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}