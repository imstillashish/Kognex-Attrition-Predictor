import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building } from 'pixelarticons/react/Building';
import { WarningDiamond } from 'pixelarticons/react/WarningDiamond';
import { Check } from 'pixelarticons/react/Check';
import { SegmentedControl } from './SegmentedControl';
import { UnicodeAnimation } from './UnicodeAnimation';
import { SpotlightCard } from './reactbits/SpotlightCard';

const PRESETS = {
  high: { Age: 22, OverTime_Yes: 1, DistanceFromHome: 40, JobSatisfaction: 1, EnvironmentSatisfaction: 1, WorkLifeBalance: 1, MonthlyIncome: 1500, TotalWorkingYears: 1, YearsAtCompany: 1 },
  borderline: { Age: 30, OverTime_Yes: 0, DistanceFromHome: 15, JobSatisfaction: 2, EnvironmentSatisfaction: 2, WorkLifeBalance: 2, MonthlyIncome: 6000, TotalWorkingYears: 5, YearsAtCompany: 5 },
  low: { Age: 40, OverTime_Yes: 0, DistanceFromHome: 2, JobSatisfaction: 4, EnvironmentSatisfaction: 4, WorkLifeBalance: 4, MonthlyIncome: 12000, TotalWorkingYears: 15, YearsAtCompany: 10 }
};

export function SinglePredictor() {
  const [formData, setFormData] = useState({
    Age: 35,
    OverTime_Yes: 0,
    DistanceFromHome: 10,
    JobSatisfaction: 3,
    EnvironmentSatisfaction: 3,
    WorkLifeBalance: 3,
    MonthlyIncome: 5000,
    TotalWorkingYears: 8,
    YearsAtCompany: 5
  });

  const [result, setResult] = useState(null);
  const [simulations, setSimulations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDriverName = (name) => {
    return name.replace('_Yes', '').replace(/([A-Z])/g, ' $1').trim();
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSimulations(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Prediction failed');
      const data = await response.json();
      setResult(data);

      if (data.attrition === 'Yes') {
        runSimulations(formData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runSimulations = async (baseData) => {
    const simActions = [
      { action: 'Salary Increase (+₹2k)', patch: { MonthlyIncome: baseData.MonthlyIncome + 2000 } },
      { action: 'Remove Overtime', patch: { OverTime_Yes: 0 } },
      { action: 'Improve Environment', patch: { EnvironmentSatisfaction: 4, WorkLifeBalance: 4 } }
    ];

    try {
      const results = await Promise.all(simActions.map(async (sim) => {
        const simData = { ...baseData, ...sim.patch };
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simData)
        });
        const data = await res.json();
        return { action: sim.action, prob: data.risk_probability };
      }));
      setSimulations(results);
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRiskLevel = (probability) => {
    if (probability < 0.3) return { level: 'low', label: 'Low', color: '#4CAF50' };
    if (probability < 0.7) return { level: 'medium', label: 'Medium', color: '#FFC107' };
    return { level: 'high', label: 'High', color: 'var(--color-signal-violet)' };
  };

  return (
    <div className="split-layout">
      {/* Left Column: Compact Form */}
      <div>
        {/* Presets Row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className="button-compact"
              onClick={() => setFormData(preset)}
              style={{ flex: 1, padding: '10px 12px', fontSize: '12px' }}
            >
              {key === 'high' ? 'High Risk' : key === 'borderline' ? 'Borderline' : 'Low Risk'}
            </button>
          ))}
        </div>

        <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Row 1: Age & Income */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>
                <span>Age</span>
                <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{formData.Age}</span>
              </label>
              <input type="range" className="range-slider" min="18" max="65" value={formData.Age} onChange={(e) => updateField('Age', parseInt(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>Monthly Income (₹)</label>
              <input type="number" className="text-input" min="0" value={formData.MonthlyIncome} onChange={(e) => updateField('MonthlyIncome', parseInt(e.target.value) || 0)} style={{ padding: '10px 12px', fontSize: '14px' }} />
            </div>
          </div>

          {/* Row 2: Overtime & Distance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>Overtime</label>
              <SegmentedControl options={[{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }]} value={formData.OverTime_Yes} onChange={(val) => updateField('OverTime_Yes', val)} />
            </div>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>
                <span>Distance (mi)</span>
                <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{formData.DistanceFromHome}</span>
              </label>
              <input type="range" className="range-slider" min="1" max="50" value={formData.DistanceFromHome} onChange={(e) => updateField('DistanceFromHome', parseInt(e.target.value))} />
            </div>
          </div>

          {/* Satisfaction Metrics - Compact Grid */}
          <div style={{ background: 'rgba(247, 249, 250, 0.03)', borderRadius: '12px', padding: '16px', border: 'var(--hairline-divider)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-steel)', marginBottom: '6px' }}>
                  <span>Job Sat.</span>
                  <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{formData.JobSatisfaction}</span>
                </label>
                <SegmentedControl options={[{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }]} value={formData.JobSatisfaction} onChange={(val) => updateField('JobSatisfaction', val)} />
              </div>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-steel)', marginBottom: '6px' }}>
                  <span>Env. Sat.</span>
                  <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{formData.EnvironmentSatisfaction}</span>
                </label>
                <SegmentedControl options={[{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }]} value={formData.EnvironmentSatisfaction} onChange={(val) => updateField('EnvironmentSatisfaction', val)} />
              </div>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-steel)', marginBottom: '6px' }}>
                  <span>Work-Life</span>
                  <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{formData.WorkLifeBalance}</span>
                </label>
                <SegmentedControl options={[{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }]} value={formData.WorkLifeBalance} onChange={(val) => updateField('WorkLifeBalance', val)} />
              </div>
            </div>
          </div>

          {/* Row 3: Experience */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>
                <span>Total Years</span>
                <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{formData.TotalWorkingYears}</span>
              </label>
              <input type="range" className="range-slider" min="0" max="40" value={formData.TotalWorkingYears} onChange={(e) => updateField('TotalWorkingYears', parseInt(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-steel)', marginBottom: '8px' }}>
                <span>Years at Co.</span>
                <span style={{ fontFamily: 'var(--font-whyte-inktrap-mono)', color: 'var(--color-signal-violet)' }}>{formData.YearsAtCompany}</span>
              </label>
              <input type="range" className="range-slider" min="0" max="30" value={formData.YearsAtCompany} onChange={(e) => updateField('YearsAtCompany', parseInt(e.target.value))} />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="button-filled" disabled={loading} style={{ padding: '14px 24px', fontSize: '14px' }}>
            {loading ? <UnicodeAnimation type="braille" text="Analyzing..." /> : 'Run Prediction'}
          </button>
        </form>
      </div>

      {/* Right Column: Results */}
      <div>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SpotlightCard 
                className={result.attrition === 'Yes' ? 'card-violet-bloom' : 'card'}
                spotlightColor={result.attrition === 'Yes' ? 'rgba(175, 80, 255, 0.25)' : 'rgba(76, 175, 80, 0.25)'}
                style={{
                  padding: '32px',
                  border: result.attrition !== 'Yes' ? 'var(--hairline-divider)' : '1px solid rgba(175, 80, 255, 0.3)'
                }}
              >
              {/* Risk Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: result.attrition === 'Yes' ? 'rgba(175, 80, 255, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: `2px solid ${result.attrition === 'Yes' ? 'var(--color-signal-violet)' : '#4CAF50'}`
                }}>
                  {result.attrition === 'Yes' ? (
                    <WarningDiamond size={32} style={{ color: 'var(--color-signal-violet)' }} />
                  ) : (
                    <Check size={32} style={{ color: '#4CAF50' }} />
                  )}
                </div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '4px',
                  color: result.attrition === 'Yes' ? 'var(--color-signal-violet)' : '#4CAF50'
                }}>
                  {result.attrition === 'Yes' ? 'High Flight Risk' : 'Low Flight Risk'}
                </h2>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-whyte-inktrap-mono)',
                  margin: '8px 0'
                }}>
                  {(result.risk_probability * 100).toFixed(1)}%
                </div>
                <div className={`status-badge ${result.attrition === 'Yes' ? 'warning' : 'success'}`} style={{ fontSize: '11px', padding: '6px 12px' }}>
                  {result.attrition === 'Yes' ? 'Intervention Needed' : 'Status Normal'}
                </div>
              </div>

              {/* Risk Meter */}
              <div style={{ marginBottom: '24px' }}>
                <div className="risk-meter" style={{ height: '6px' }}>
                  <div className={`risk-meter-fill ${getRiskLevel(result.risk_probability).level}`} style={{ width: `${result.risk_probability * 100}%` }} />
                </div>
              </div>

              {/* Risk Drivers */}
              {result.top_drivers && result.top_drivers.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-steel)', marginBottom: '12px' }}>
                    Key Risk Factors
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.top_drivers.slice(0, 4).map((driver, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'rgba(247, 249, 250, 0.03)',
                        borderRadius: '8px',
                        border: 'var(--hairline-divider-subtle)'
                      }}>
                        <span style={{ fontSize: '13px' }}>{formatDriverName(driver.feature)}</span>
                        <span style={{
                          fontFamily: 'var(--font-whyte-inktrap-mono)',
                          fontSize: '12px',
                          color: driver.impact > 0 ? 'var(--color-signal-violet)' : '#4CAF50'
                        }}>
                          {driver.impact > 0 ? '↑' : '↓'} {Math.abs(driver.impact).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulations */}
              {result.attrition === 'Yes' && simulations && (
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-steel)', marginBottom: '12px' }}>
                    Remediation Scenarios
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {simulations.map((sim, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: sim.prob < 0.5 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(247, 249, 250, 0.03)',
                        borderRadius: '8px',
                        border: sim.prob < 0.5 ? '1px solid rgba(76, 175, 80, 0.3)' : 'var(--hairline-divider-subtle)'
                      }}>
                        <span style={{ fontSize: '13px' }}>{sim.action}</span>
                        <span style={{
                          fontFamily: 'var(--font-whyte-inktrap-mono)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: sim.prob < 0.5 ? '#4CAF50' : 'var(--color-signal-violet)'
                        }}>
                          {(sim.prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </SpotlightCard>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '400px',
                border: 'var(--hairline-divider)',
                textAlign: 'center',
                padding: '48px 32px'
              }}
            >
              <Building size={48} style={{ color: 'var(--color-steel)', marginBottom: '20px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Awaiting Analysis</h2>
              <p style={{ color: 'var(--color-steel)', fontSize: '14px', maxWidth: '250px' }}>
                Configure the employee profile and run prediction to see results.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}