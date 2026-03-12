import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.css';

export default function Dashboard() {
    const { admin } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    // ── Fetch all employees ──────────────────────────────────────────────
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

    // ── Hero stats ───────────────────────────────────────────────────────
    const totalEmployees = employees.length;
    const avgExp = employees.length
        ? (employees.reduce((sum, e) => sum + Number(e.years_of_exp), 0) / employees.length).toFixed(1)
        : 0;
    const uniqueAreas = [
        ...new Set(employees.flatMap((e) => e.areas.map((a) => a.area_name)))
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
                <button className="btn btn-primary btn-sm">
                    + Add Employee
                </button>
            </div>

            {/* ── Table ───────────────────────────────────────────────── */}
            <div className="table-container">
                {loading && (
                    <div className="table-state">
                        <div className="spinner-border d-block mx-auto" role="status" />
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
                                <th>Name</th>
                                <th>Designation</th>
                                <th>Years of Exp.</th>
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
                                        {search ? 'No employees match your search.' : 'No employees found. Add one!'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((emp) => (
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
                                                <span key={a.functional_area_id} className="area-tag">
                                                    {a.area_name}
                                                </span>
                                            ))}
                                        </td>
                                        <td>{emp.graduation_deg}</td>
                                        <td>
                                            <button className="btn-chart">
                                                📊 Radar
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit">
                                                    Edit
                                                </button>
                                                <button className="btn-delete">
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

        </div>
    );
}