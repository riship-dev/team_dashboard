import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import './RadarChartModal.css';

// ── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const { area, rating } = payload[0].payload;
        return (
            <div className="radar-tooltip">
                <p className="radar-tooltip-area">{area}</p>
                <p className="radar-tooltip-rating">{rating} / 10</p>
            </div>
        );
    }
    return null;
}

// ── Custom Dot ───────────────────────────────────────────────────────────────
function CustomDot({ cx, cy, payload }) {
    if (!cx || !cy) return null;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#1a1a2e"
            stroke="white"
            strokeWidth={2}
        />
    );
}

export default function RadarChartModal({ employee, onClose }) {
    // Build chart data from employee areas
    const chartData = employee.areas.map((a) => ({
        area:   a.area_name,
        rating: parseFloat(a.rating),
    }));

    // Overall score — average of all ratings
    const avgRating = (
        chartData.reduce((sum, d) => sum + d.rating, 0) / chartData.length
    ).toFixed(1);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="radar-modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── Header ──────────────────────────────────────────── */}
                <div className="radar-modal-header">
                    <div className="radar-modal-title-group">
                        <h5 className="radar-modal-name">{employee.emp_name}</h5>
                        <span className="radar-modal-designation">
                            {employee.designation}
                        </span>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* ── Score Badge ──────────────────────────────────────── */}
                <div className="radar-score-row">
                    <div className="radar-score-badge">
                        <span className="radar-score-number">{avgRating}</span>
                        <span className="radar-score-label">Avg. Score</span>
                    </div>
                    <div className="radar-area-pills">
                        {chartData.map((d) => (
                            <span key={d.area} className="radar-area-pill">
                                {d.area}
                                <strong> {d.rating}</strong>
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Chart ───────────────────────────────────────────── */}
                {chartData.length < 3 ? (
                    <div className="radar-min-warning">
                        ⚠️ At least 3 functional areas are needed to render a radar chart.
                        This employee has {chartData.length}.
                    </div>
                ) : (
                    <div className="radar-chart-wrapper">
                        <ResponsiveContainer width="100%" height={380}>
                            <RadarChart
                                data={chartData}
                                margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                            >
                                <PolarGrid
                                    gridType="polygon"
                                    stroke="#e0e0e8"
                                />
                                <PolarAngleAxis
                                    dataKey="area"
                                    tick={{
                                        fill:       '#444',
                                        fontSize:   13,
                                        fontWeight: 500,
                                    }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 10]}
                                    tickCount={6}
                                    tick={{
                                        fill:     '#aaa',
                                        fontSize: 11,
                                    }}
                                    axisLine={false}
                                />
                                <Radar
                                    name={employee.emp_name}
                                    dataKey="rating"
                                    stroke="#1a1a2e"
                                    fill="#1a1a2e"
                                    fillOpacity={0.18}
                                    strokeWidth={2}
                                    dot={<CustomDot />}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* ── Footer ──────────────────────────────────────────── */}
                <div className="radar-modal-footer">
                    <span className="radar-emp-id">
                        Employee ID: {employee.emp_id}
                    </span>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}