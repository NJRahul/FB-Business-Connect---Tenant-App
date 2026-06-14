import { useState, useRef } from 'react';
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Download, RefreshCw,
  Clock, ChevronRight, ArrowRight, Trash2
} from 'lucide-react';

type ImportType = 'customers' | 'jobs' | 'quickbooks';
type ImportStep = 'upload' | 'mapping' | 'importing' | 'results';

interface ImportJob {
  id: string;
  type: ImportType;
  fileName: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  createdAt: string;
  rollbackAvailableUntil: string;
}

const CUSTOMER_FIELDS = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'vehicle_year', 'vehicle_make', 'vehicle_model'];
const SAMPLE_COLUMNS = ['Full Name', 'Email Address', 'Phone #', 'Street', 'City', 'State', 'Zip', 'Car Year', 'Make', 'Model'];

const PAST_IMPORTS: ImportJob[] = [
  { id: '1', type: 'customers', fileName: 'customers_export_2026.csv', status: 'complete', total: 1847, imported: 1823, skipped: 14, failed: 10, createdAt: '2026-06-10', rollbackAvailableUntil: '2026-06-17' },
  { id: '2', type: 'jobs', fileName: 'historical_orders_q1.xlsx', status: 'complete', total: 342, imported: 340, skipped: 2, failed: 0, createdAt: '2026-06-05', rollbackAvailableUntil: '2026-06-12' },
  { id: '3', type: 'quickbooks', fileName: 'export_2025.iif', status: 'failed', total: 0, imported: 0, skipped: 0, failed: 0, createdAt: '2026-05-28', rollbackAvailableUntil: '2026-06-04' },
];

const IMPORT_TYPES = [
  { id: 'customers' as ImportType, label: 'Customer List', desc: 'CSV or XLSX with customer contact data', icon: '👥', ext: '.csv, .xlsx' },
  { id: 'jobs' as ImportType, label: 'Historical Jobs/Orders', desc: 'Past service records for analytics', icon: '🔧', ext: '.csv, .xlsx' },
  { id: 'quickbooks' as ImportType, label: 'QuickBooks Desktop', desc: 'IIF or QBXML file export', icon: '💼', ext: '.iif, .qbxml' },
];

const SAMPLE_RESULTS = [
  { row: 1, name: 'John Martinez', status: 'imported', note: '' },
  { row: 2, name: 'Sarah Johnson', status: 'imported', note: '' },
  { row: 3, name: 'Bob Wilson', status: 'skipped', note: 'Duplicate email: bob@email.com' },
  { row: 4, name: 'Mary Davis', status: 'imported', note: '' },
  { row: 5, name: 'Tom Brown', status: 'failed', note: 'Missing required field: email' },
  { row: 6, name: 'Alice Cooper', status: 'imported', note: '' },
  { row: 7, name: 'James Lee', status: 'failed', note: 'Invalid phone format: 555-ABCD' },
  { row: 8, name: 'Carol White', status: 'imported', note: '' },
];

export function DataImportPage() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [importType, setImportType] = useState<ImportType>('customers');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({
    'Full Name': 'first_name+last_name',
    'Email Address': 'email',
    'Phone #': 'phone',
    'Street': 'address',
    'City': 'city',
    'State': 'state',
    'Zip': 'zip',
    'Car Year': 'vehicle_year',
    'Make': 'vehicle_make',
    'Model': 'vehicle_model',
  });
  const [importProgress, setImportProgress] = useState(0);
  const [scheduleOffPeak, setScheduleOffPeak] = useState(false);
  const [jobs, setJobs] = useState<ImportJob[]>(PAST_IMPORTS);
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleStartImport = async () => {
    if (!file) return;
    setStep('importing');
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setImportProgress(i);
    }
    setStep('results');
    const newJob: ImportJob = {
      id: Date.now().toString(),
      type: importType,
      fileName: file.name,
      status: 'complete',
      total: SAMPLE_RESULTS.length,
      imported: SAMPLE_RESULTS.filter(r => r.status === 'imported').length,
      skipped: SAMPLE_RESULTS.filter(r => r.status === 'skipped').length,
      failed: SAMPLE_RESULTS.filter(r => r.status === 'failed').length,
      createdAt: new Date().toISOString().split('T')[0],
      rollbackAvailableUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setImportProgress(0);
  };

  const isRollbackExpired = (until: string) => new Date(until) < new Date();

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontSize: '1.5rem', fontWeight: 700 }}>Data Import</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem', marginTop: '4px' }}>Import customers, jobs, and QuickBooks data with field mapping and rollback support</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Main import flow */}
        <div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {(['upload', 'mapping', 'importing', 'results'] as ImportStep[]).map((s, i) => {
              const steps = ['upload', 'mapping', 'importing', 'results'];
              const currentIdx = steps.indexOf(step);
              const thisIdx = steps.indexOf(s);
              const isDone = thisIdx < currentIdx;
              const isCurrent = s === step;
              const labels = ['Upload', 'Map Fields', 'Importing', 'Results'];
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        background: isDone ? '#27AE60' : isCurrent ? '#C0392B' : '#E5E7EB',
                        color: isDone || isCurrent ? '#fff' : '#9CA3AF',
                      }}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <span style={{ color: isCurrent ? '#C0392B' : isDone ? '#27AE60' : '#9CA3AF', fontSize: '0.875rem', fontWeight: isCurrent ? 600 : 400 }}>
                      {labels[i]}
                    </span>
                  </div>
                  {i < 3 && <ChevronRight size={16} style={{ color: '#D1D5DB' }} />}
                </div>
              );
            })}
          </div>

          {/* Upload step */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '12px' }}>Import Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {IMPORT_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setImportType(t.id)}
                      className="p-4 rounded-[8px] text-left transition-all"
                      style={{
                        border: importType === t.id ? '2px solid #C0392B' : '2px solid #E5E7EB',
                        background: importType === t.id ? '#FDEDEC' : '#fff',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                      <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem', marginTop: '8px' }}>{t.label}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '4px', lineHeight: 1.4 }}>{t.desc}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', marginTop: '6px' }}>Accepts: {t.ext}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[8px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '12px' }}>Upload File</h3>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[8px] p-10 flex flex-col items-center justify-center cursor-pointer transition-all"
                  style={{
                    border: isDragging ? '2px solid #C0392B' : `2px dashed ${file ? '#27AE60' : '#E5E7EB'}`,
                    background: isDragging ? '#FDEDEC' : file ? '#F0FDF4' : '#F9FAFB',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.iif,.qbxml"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                  />
                  {file ? (
                    <>
                      <CheckCircle2 size={32} style={{ color: '#27AE60', marginBottom: '12px' }} />
                      <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>{file.name}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.8125rem', marginTop: '4px' }}>
                        {(file.size / 1024).toFixed(1)} KB · Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={32} style={{ color: isDragging ? '#C0392B' : '#9CA3AF', marginBottom: '12px' }} />
                      <p style={{ color: '#1A1A1A', fontWeight: 600 }}>Drag & drop your file here</p>
                      <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>or click to browse</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '8px' }}>Supports CSV, XLSX, IIF, QBXML</p>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleOffPeak}
                      onChange={e => setScheduleOffPeak(e.target.checked)}
                      style={{ accentColor: '#C0392B' }}
                    />
                    <div>
                      <span style={{ color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 500 }}>Schedule for off-peak hours</span>
                      <span style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginLeft: '6px' }}>(runs at 2:00 AM CT)</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => file && setStep('mapping')}
                  disabled={!file}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-white transition-colors"
                  style={{ background: !file ? '#E5E7EB' : '#C0392B', fontWeight: 600, cursor: !file ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (file) e.currentTarget.style.background = '#A93226'; }}
                  onMouseLeave={e => { if (file) e.currentTarget.style.background = '#C0392B'; }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Mapping step */}
          {step === 'mapping' && (
            <div className="space-y-5">
              <div className="bg-white rounded-[8px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="p-5 border-b" style={{ borderColor: '#E5E7EB' }}>
                  <h3 style={{ color: '#1A1A1A', fontWeight: 600 }}>Map Source Columns to TDforge Fields</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
                    We detected {SAMPLE_COLUMNS.length} columns in <strong style={{ color: '#1A1A1A' }}>{file?.name}</strong>. Map each to the correct TDforge field.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '400px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                        <th className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Column</th>
                        <th className="px-3 py-3" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600 }}></th>
                        <th className="text-left px-5 py-3" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TDforge Field</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_COLUMNS.map(col => (
                        <tr key={col} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px]" style={{ background: '#F3F4F6', color: '#1A1A1A', fontSize: '0.875rem', fontWeight: 500 }}>
                              <FileText size={12} style={{ color: '#9CA3AF' }} />
                              {col}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <ArrowRight size={14} style={{ color: '#9CA3AF' }} />
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={mapping[col] || ''}
                              onChange={e => setMapping(prev => ({ ...prev, [col]: e.target.value }))}
                              className="rounded-[6px] px-3 py-2 text-sm outline-none"
                              style={{ border: '1.5px solid #E5E7EB', color: mapping[col] ? '#1A1A1A' : '#9CA3AF', background: '#fff', minWidth: '200px' }}
                            >
                              <option value="">— Skip this column —</option>
                              <option value="first_name+last_name">first_name + last_name (split)</option>
                              {CUSTOMER_FIELDS.map(f => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('upload')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[6px]"
                  style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 500, background: '#fff' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleStartImport}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-white transition-colors"
                  style={{ background: '#C0392B', fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
                >
                  Start Import <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Importing step */}
          {step === 'importing' && (
            <div className="bg-white rounded-[8px] p-8 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#FDEDEC' }}>
                <RefreshCw size={28} style={{ color: '#C0392B' }} className="animate-spin" />
              </div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#1A1A1A', fontWeight: 700, fontSize: '1.125rem' }}>
                Importing your data...
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '8px', marginBottom: '24px' }}>
                Processing {file?.name}
              </p>
              <div className="max-w-sm mx-auto">
                <div className="flex justify-between mb-2">
                  <span style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Progress</span>
                  <span style={{ color: '#C0392B', fontWeight: 700, fontSize: '0.8125rem' }}>{importProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${importProgress}%`, background: '#C0392B' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results step */}
          {step === 'results' && (
            <div className="space-y-5">
              <div className="bg-white rounded-[8px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 style={{ color: '#1A1A1A', fontWeight: 600 }}>Import Complete</h3>
                  <CheckCircle2 size={22} style={{ color: '#27AE60' }} />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Imported', value: SAMPLE_RESULTS.filter(r => r.status === 'imported').length, color: '#27AE60', bg: '#F0FDF4' },
                    { label: 'Skipped (duplicate)', value: SAMPLE_RESULTS.filter(r => r.status === 'skipped').length, color: '#F39C12', bg: '#FFF7ED' },
                    { label: 'Failed', value: SAMPLE_RESULTS.filter(r => r.status === 'failed').length, color: '#E74C3C', bg: '#FEF2F2' },
                  ].map(s => (
                    <div key={s.label} className="rounded-[8px] p-4 text-center" style={{ background: s.bg }}>
                      <p style={{ color: s.color, fontWeight: 700, fontSize: '1.75rem', fontFamily: 'Sora, sans-serif' }}>{s.value}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '4px' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '400px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                        {['Row', 'Name', 'Status', 'Note'].map(h => (
                          <th key={h} className="text-left px-3 py-2" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_RESULTS.map(r => (
                        <tr key={r.row} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td className="px-3 py-2" style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{r.row}</td>
                          <td className="px-3 py-2" style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>{r.name}</td>
                          <td className="px-3 py-2">
                            <span
                              className="px-2 py-0.5 rounded-[4px] text-xs font-semibold"
                              style={{
                                background: r.status === 'imported' ? '#F0FDF4' : r.status === 'skipped' ? '#FFF7ED' : '#FEF2F2',
                                color: r.status === 'imported' ? '#15803D' : r.status === 'skipped' ? '#92400E' : '#B91C1C',
                              }}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-3 py-2" style={{ color: '#6B7280', fontSize: '0.8125rem' }}>{r.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  {SAMPLE_RESULTS.filter(r => r.status === 'failed').length > 0 && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-[6px]"
                      style={{ border: '1.5px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500, background: '#fff' }}
                    >
                      <Download size={14} /> Download Failed Rows
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-white transition-colors"
                    style={{ background: '#C0392B', fontWeight: 600, fontSize: '0.875rem' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#A93226')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#C0392B')}
                  >
                    <Upload size={14} /> Import Another File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Import history */}
        <div>
          <div className="bg-white rounded-[8px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h3 style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.9375rem' }}>Import History</h3>
            </div>
            <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
              {jobs.map(job => (
                <div key={job.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>{job.fileName}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>{job.createdAt}</p>
                    </div>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-[4px] text-xs font-semibold"
                      style={{
                        background: job.status === 'complete' ? '#F0FDF4' : job.status === 'failed' ? '#FEF2F2' : '#FFF7ED',
                        color: job.status === 'complete' ? '#15803D' : job.status === 'failed' ? '#B91C1C' : '#92400E',
                      }}
                    >
                      {job.status}
                    </span>
                  </div>
                  {job.status === 'complete' && (
                    <div className="flex gap-3 mb-3">
                      <span style={{ color: '#27AE60', fontSize: '0.75rem', fontWeight: 500 }}>✓ {job.imported} imported</span>
                      {job.skipped > 0 && <span style={{ color: '#F39C12', fontSize: '0.75rem' }}>↷ {job.skipped} skipped</span>}
                      {job.failed > 0 && <span style={{ color: '#E74C3C', fontSize: '0.75rem' }}>✗ {job.failed} failed</span>}
                    </div>
                  )}
                  {job.status === 'complete' && !isRollbackExpired(job.rollbackAvailableUntil) && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock size={12} style={{ color: '#9CA3AF' }} />
                        <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Rollback until {job.rollbackAvailableUntil}</span>
                      </div>
                      {rollbackTarget === job.id ? (
                        <div className="rounded-[6px] p-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                          <p style={{ color: '#B91C1C', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>
                            Roll back this import?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRollbackTarget(null)}
                              className="flex-1 py-1.5 rounded text-xs font-semibold"
                              style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#fff' }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setJobs(prev => prev.filter(j => j.id !== job.id));
                                setRollbackTarget(null);
                              }}
                              className="flex-1 py-1.5 rounded text-xs font-semibold text-white"
                              style={{ background: '#E74C3C' }}
                            >
                              Confirm Rollback
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRollbackTarget(job.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] w-full justify-center"
                          style={{ border: '1px solid #FECACA', color: '#E74C3C', fontSize: '0.75rem', fontWeight: 600, background: '#FEF2F2' }}
                        >
                          <Trash2 size={12} /> Rollback Import
                        </button>
                      )}
                    </div>
                  )}
                  {job.status === 'complete' && isRollbackExpired(job.rollbackAvailableUntil) && (
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Rollback window expired</p>
                  )}
                  {job.status === 'failed' && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle size={12} style={{ color: '#E74C3C' }} />
                      <span style={{ color: '#E74C3C', fontSize: '0.75rem' }}>Upload format not recognized</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
