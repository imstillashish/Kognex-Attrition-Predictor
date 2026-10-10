import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { Upload } from 'pixelarticons/react/Upload';
import { Users } from 'pixelarticons/react/Users';
import { WarningDiamond } from 'pixelarticons/react/WarningDiamond';
import { Check } from 'pixelarticons/react/Check';
import { UnicodeAnimation } from './UnicodeAnimation';

const REMEDIATIONS = {
  "JobSatisfaction": "Consider regular 1-on-1s and role adjustments to improve job satisfaction.",
  "MonthlyIncome": "Review compensation package for market competitiveness.",
  "OverTime_Yes": "Reduce excessive overtime to prevent burnout.",
  "DistanceFromHome": "Offer flexible remote work or commute subsidies.",
  "EnvironmentSatisfaction": "Address workplace environment concerns and team dynamics.",
  "WorkLifeBalance": "Encourage taking PTO and setting clear after-hours boundaries.",
  "Age": "Ensure clear career progression and mentorship opportunities.",
  "YearsAtCompany": "Provide new career growth opportunities and challenges.",
  "TotalWorkingYears": "Acknowledge experience and offer senior responsibilities or sabbaticals."
};

export function BatchPredictor() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [dragOver, setDragOver] = useState(false);

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const processCSV = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const validData = results.data.filter(row => Object.keys(row).length > 0);

          const response = await fetch('/api/predict_batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validData)
          });

          if (!response.ok) throw new Error('Batch prediction failed');
          const data = await response.json();

          setResults(data.results.sort((a, b) => b.risk_probability - a.risk_probability));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      processCSV(file);
    } else {
      setError('Please upload a valid CSV file.');
    }
  }, [processCSV]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const filteredResults = results.filter(res => {
    if (filter === 'high') return res.attrition === 'Yes';
    if (filter === 'low') return res.attrition === 'No';
    return true;
  });

  const stats = {
    total: results.length,
    highRisk: results.filter(r => r.attrition === 'Yes').length,
    lowRisk: results.filter(r => r.attrition === 'No').length,
    avgRisk: results.length > 0 ? results.reduce((sum, r) => sum + r.risk_probability, 0) / results.length : 0
  };

  const getRiskLevel = (probability) => {
    if (probability < 0.3) return { level: 'low', label: 'Low', color: '#4CAF50' };
    if (probability < 0.7) return { level: 'medium', label: 'Medium', color: '#FFC107' };
    return { level: 'high', label: 'High', color: 'var(--color-signal-violet)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Compact Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onClick={() => document.getElementById('csv-upload').click()}
        style={{ cursor: loading ? 'wait' : 'pointer', padding: '40px 32px' }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && processCSV(e.target.files[0])}
          style={{ display: 'none' }}
          id="csv-upload"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', textAlign: 'left' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(175, 80, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {loading ? (
              <UnicodeAnimation type="blocks" text="" />
            ) : (
              <Upload size={28} style={{ color: 'var(--color-signal-violet)' }} />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              {loading ? 'Processing...' : 'Drop CSV File'}
            </h3>
            <p style={{ color: 'var(--color-steel)', fontSize: '13px', margin: 0 }}>
              {loading ? 'Analyzing employee records...' : 'or click to browse • supports standard CSV format'}
            </p>
          </div>

          {!loading && (
            <div style={{
              color: 'var(--color-signal-violet)',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'underline'
            }}>
              <a
                href="/sample_employees.csv"
                download
                style={{ color: 'inherit', textDecoration: 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                Download template
              </a>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(175, 80, 255, 0.1)',
            border: '1px solid rgba(175, 80, 255, 0.3)',
            borderRadius: '8px',
            color: 'var(--color-signal-violet)',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Compact Stats Row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                flex: 1,
                padding: '16px',
                background: 'rgba(247, 249, 250, 0.03)',
                borderRadius: '12px',
                border: 'var(--hairline-divider)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-whyte-inktrap-mono)' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>Total</div>
              </div>

              <div style={{
                flex: 1,
                padding: '16px',
                background: 'rgba(175, 80, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(175, 80, 255, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>
                  {stats.highRisk}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>High Risk</div>
              </div>

              <div style={{
                flex: 1,
                padding: '16px',
                background: 'rgba(76, 175, 80, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-whyte-inktrap-mono)', color: '#4CAF50' }}>
                  {stats.lowRisk}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>Low Risk</div>
              </div>

              <div style={{
                flex: 1,
                padding: '16px',
                background: 'rgba(247, 249, 250, 0.03)',
                borderRadius: '12px',
                border: 'var(--hairline-divider)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-whyte-inktrap-mono)' }}>
                  {(stats.avgRisk * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>Avg Risk</div>
              </div>
            </div>

            {/* Table Header with Filters */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} style={{ color: 'var(--color-signal-violet)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  {filteredResults.length} Employees
                </span>
              </div>

              <div style={{ display: 'flex', gap: '4px', background: 'rgba(247, 249, 250, 0.04)', padding: '3px', borderRadius: 'var(--radius-pills)' }}>
                {['all', 'high', 'low'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pills)',
                      border: 'none',
                      background: filter === f ? 'var(--surface-void-canvas)' : 'transparent',
                      color: filter === f ? 'var(--color-almost-white)' : 'var(--color-steel)',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {f === 'all' ? 'All' : f === 'high' ? 'High Risk' : 'Low Risk'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ border: 'var(--hairline-divider)', borderRadius: '12px', overflow: 'hidden' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>ID</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Risk</th>
                    <th style={{ padding: '12px 16px', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((res, i) => {
                    const riskLevel = getRiskLevel(res.risk_probability);
                    return (
                      <React.Fragment key={i}>
                        <tr
                          data-high-risk={res.attrition === 'Yes'}
                          onClick={() => toggleRow(i)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', fontSize: '13px' }}>
                              #{res.original_data?.EmployeeNumber || res.id || i + 1}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`status-badge ${res.attrition === 'Yes' ? 'warning' : 'success'}`} style={{ fontSize: '10px', padding: '4px 10px' }}>
                              {res.attrition === 'Yes' ? <WarningDiamond size={12} /> : <Check size={12} />}
                              {res.attrition === 'Yes' ? 'High' : 'Low'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="risk-meter" style={{ flex: 1, height: '4px' }}>
                                <div className={`risk-meter-fill ${riskLevel.level}`} style={{ width: `${res.risk_probability * 100}%` }} />
                              </div>
                              <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', fontSize: '12px', color: riskLevel.color, minWidth: '45px' }}>
                                {(res.risk_probability * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <motion.span animate={{ rotate: expandedRows.has(i) ? 180 : 0 }} style={{ display: 'inline-block', fontSize: '10px', color: 'var(--color-steel)' }}>
                              ▼
                            </motion.span>
                          </td>
                        </tr>

                        <AnimatePresence>
                          {expandedRows.has(i) && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              data-high-risk={res.attrition === 'Yes'}
                            >
                              <td colSpan="4" style={{ padding: 0 }}>
                                <div style={{ padding: '16px', background: 'rgba(247, 249, 250, 0.02)', borderTop: 'var(--hairline-divider-subtle)' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: res.attrition === 'Yes' ? '16px' : 0 }}>
                                    {Object.entries(res.original_data || {}).slice(0, 6).map(([key, value]) => (
                                      <div key={key} style={{ padding: '8px', background: 'rgba(247, 249, 250, 0.04)', borderRadius: '6px', fontSize: '11px' }}>
                                        <div style={{ color: 'var(--color-steel)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                          {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', fontWeight: 500 }}>
                                          {value !== null && value !== '' ? value : '-'}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {res.attrition === 'Yes' && res.top_drivers && res.top_drivers.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {res.top_drivers.slice(0, 2).map((driver, idx) => (
                                        <div key={idx} style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          padding: '10px',
                                          background: 'rgba(175, 80, 255, 0.05)',
                                          borderRadius: '8px',
                                          fontSize: '12px'
                                        }}>
                                          <span style={{ fontWeight: 500, flex: 1 }}>
                                            {driver.feature.replace(/([A-Z])/g, ' $1').replace('_Yes', '').trim()}
                                          </span>
                                          <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: driver.impact > 0 ? 'var(--color-signal-violet)' : '#4CAF50', fontSize: '11px' }}>
                                            {driver.impact > 0 ? '+' : ''}{driver.impact.toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}