import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UnicodeAnimation } from './UnicodeAnimation';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dataset_stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 40px' }}>
      <UnicodeAnimation type="blocks" text="" />
      <p style={{ color: 'var(--color-steel)', fontSize: '14px', marginTop: '12px' }}>Loading analytics...</p>
    </div>
  );

  if (error) return (
    <div className="card" style={{ padding: '40px', textAlign: 'center', border: 'var(--hairline-divider)' }}>
      <p style={{ color: 'var(--color-signal-violet)', fontSize: '14px' }}>Error: {error}</p>
    </div>
  );

  const deptData = Object.keys(stats.department_attrition).map(dept => ({
    name: dept,
    Retained: stats.department_attrition[dept]['No'] || 0,
    Lost: stats.department_attrition[dept]['Yes'] || 0
  }));

  const roleData = Object.keys(stats.role_attrition).map(role => ({
    name: role.replace(/([A-Z])/g, ' $1').trim(),
    Retained: stats.role_attrition[role]['No'] || 0,
    Lost: stats.role_attrition[role]['Yes'] || 0
  }));

  const totalEmployees = deptData.reduce((sum, dept) => sum + dept.Retained + dept.Lost, 0);
  const totalAttrition = deptData.reduce((sum, dept) => sum + dept.Lost, 0);
  const attritionRate = totalEmployees > 0 ? (totalAttrition / totalEmployees * 100).toFixed(1) : 0;
  const worstDepartment = deptData.reduce((max, dept) => dept.Lost > max.Lost ? dept : max, deptData[0]);

  const tooltipStyle = {
    backgroundColor: 'var(--surface-void-canvas)',
    border: '1px solid rgba(247,249,250,0.2)',
    borderRadius: '8px',
    color: 'var(--color-almost-white)',
    fontSize: '12px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Compact Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ padding: '16px', background: 'rgba(247, 249, 250, 0.03)', borderRadius: '12px', border: 'var(--hairline-divider)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-whyte-inktrap-mono)' }}>{totalEmployees}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>Employees</div>
        </div>
        <div style={{ padding: '16px', background: 'rgba(175, 80, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(175, 80, 255, 0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{attritionRate}%</div>
          <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>Attrition</div>
        </div>
        <div style={{ padding: '16px', background: 'rgba(255, 193, 7, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 193, 7, 0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-whyte-inktrap-mono)', color: '#FFC107' }}>{totalAttrition}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>Lost</div>
        </div>
        <div style={{ padding: '16px', background: 'rgba(247, 249, 250, 0.03)', borderRadius: '12px', border: 'var(--hairline-divider)', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-whyte-inktrap-mono)' }}>{worstDepartment?.name || 'N/A'}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-steel)', textTransform: 'uppercase' }}>Highest Risk</div>
        </div>
      </div>

      {/* Charts - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Department Chart */}
        <div className="chart-container" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Department Attrition</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={deptData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(247, 249, 250, 0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-steel)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--color-steel)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Retained" stackId="a" fill="#4CAF50" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Lost" stackId="a" fill="var(--color-signal-violet)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Chart */}
        <div className="chart-container" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Job Role Attrition</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer>
              <ComposedChart data={roleData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(247, 249, 250, 0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-steel)', fontSize: 9, angle: -45, textAnchor: 'end' }} tickLine={false} axisLine={false} height={60} />
                <YAxis tick={{ fill: 'var(--color-steel)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Scatter dataKey="Retained" name="Retained" fill="#4CAF50" />
                <Scatter dataKey="Lost" name="Lost" fill="var(--color-signal-violet)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}