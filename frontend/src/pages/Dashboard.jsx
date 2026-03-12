import RadarChartModal from '../components/RadarChartModal';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import EmployeeFormModal from '../components/EmployeeFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import './Dashboard.css';

export default function Dashboard() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    // ── Modal state ──────────────────────────────────────────────────────
    const [showForm, setShowForm] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [deleteEmployee, setDeleteEmployee] = useState(null);
    const [radarEmployee, setRadarEmployee] = useState(null);
    const [sortField, setSortField] = useState(null);   // 'emp_name' | 'years_of_exp'
    const [sortOrder, setSortOrder] = useState('asc');  // 'asc' | 'desc'

    // ── Fetch employees ──────────────────────────────────────────────────
    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (err) {
            setError('Failed to load employees. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleAddClick = () => {
        setEditEmployee(null);
        setShowForm(true);
    };

    const handleEditClick = (emp) => {
        setEditEmployee(emp);
        setShowForm(true);
    };

    const handleDeleteClick = (emp) => {
        setDeleteEmployee(emp);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditEmployee(null);
    };

    const handleDeleteClose = () => {
        setDeleteEmployee(null);
    };

    const handleRadarClick = (emp) => {
        setRadarEmployee(emp);
    };

    const handleRadarClose = () => {
        setRadarEmployee(null);
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // ── Search filter ────────────────────────────────────────────────────
    const filtered = employees.filter((emp) => {
        const term = search.toLowerCase();
        return (
            emp.emp_name.toLowerCase().includes(term) ||
            emp.designation.toLowerCase().includes(term) ||
            String(emp.emp_id).includes(term) ||
            emp.areas.some((a) => a.area_name.toLowerCase().includes(term))
        );
    });
    const sorted = [...filtered].sort((a, b) => {
        if (!sortField) return 0;

        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'emp_name') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        }

        if (sortField === 'years_of_exp') {
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        return 0;
    });

    // ── Hero stats ───────────────────────────────────────────────────────
    const totalEmployees = employees.length;
    const avgExp = employees.length
        ? (
            employees.reduce((sum, e) => sum + Number(e.years_of_exp), 0) /
            employees.length
          ).toFixed(1)
        : 0;
    const uniqueAreas = [
        ...new Set(employees.flatMap((e) => e.areas.map((a) => a.area_name))),
    ].length;

    return (
        <div>

            {/* ── Hero ────────────────────────────────────────────────── */}
            <div className="hero">
                <h1>Team Overview</h1>
                <p>Manage and explore your team members</p>
                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-number">{totalEmployees}</div>
                        <div className="hero-stat-label">Total Members</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-number">{avgExp}</div>
                        <div className="hero-stat-label">Avg. Years Exp.</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-number">{uniqueAreas}</div>
                        <div className="hero-stat-label">Functional Areas</div>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="dashboard-toolbar">
                <div className="toolbar-left">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, ID, designation, area..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddClick}
                >
                    + Add Employee
                </button>
            </div>

            {/* ── Table ───────────────────────────────────────────────── */}
            <div className="table-container">
                {loading && (
                    <div className="table-state">
                        <div
                            className="spinner-border d-block mx-auto"
                            role="status"
                        />
                        Loading employees...
                    </div>
                )}

                {!loading && error && (
                    <div className="table-state">
                        <p className="text-danger">{error}</p>
                        <button
                            className="btn btn-sm btn-outline-secondary mt-2"
                            onClick={fetchEmployees}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Emp ID</th>
                                <th
                                    className="th-sortable"
                                    onClick={() => handleSort('emp_name')}
                                >
                                    Name {sortField === 'emp_name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                                </th>
                                <th>Designation</th>
                                <th
                                    className="th-sortable"
                                    onClick={() => handleSort('years_of_exp')}
                                >
                                    Years of Exp. {sortField === 'years_of_exp' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                                </th>
                                <th>Functional Areas</th>
                                <th>Graduation</th>
                                <th>Chart</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="table-state">
                                        {search
                                            ? 'No employees match your search.'
                                            : 'No employees found. Add one!'}
                                    </td>
                                </tr>
                            ) : (
                                sorted.map((emp) => (
                                    <tr key={emp.emp_id}>
                                        <td>
                                            <span className="emp-id-badge">
                                                {emp.emp_id}
                                            </span>
                                        </td>
                                        <td>{emp.emp_name}</td>
                                        <td>{emp.designation}</td>
                                        <td>{emp.years_of_exp} yrs</td>
                                        <td>
                                            {emp.areas.map((a) => (
                                                <span
                                                    key={a.functional_area_id}
                                                    className="area-tag"
                                                >
                                                    {a.area_name}
                                                </span>
                                            ))}
                                        </td>
                                        <td>{emp.graduation_deg}</td>
                                        <td>
                                            <button
                                                className="btn-chart"
                                                onClick={() => handleRadarClick(emp)}
                                            >
                                                📊 Radar
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditClick(emp)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteClick(emp)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Modals ──────────────────────────────────────────────── */}
            {showForm && (
                <EmployeeFormModal
                    employee={editEmployee}
                    onClose={handleFormClose}
                    onSaved={fetchEmployees}
                />
            )}

            {deleteEmployee && (
                <DeleteConfirmModal
                    employee={deleteEmployee}
                    onClose={handleDeleteClose}
                    onDeleted={fetchEmployees}
                />
            )}

            {radarEmployee && (
                <RadarChartModal
                    employee={radarEmployee}
                    onClose={handleRadarClose}
                />
            )}
        </div>
    );
}