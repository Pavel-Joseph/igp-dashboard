import { useEffect, useState, type FormEvent } from 'react'
import snapshot from './data/workbookSnapshot.json'

type Entry = { id: string; partner: string; quarter: number; kind: 'received' | 'expense'; date: string; amount: number; description: string }
type NewCounts = Record<string, number>
const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
const colors = ['#a72a7b', '#279bc4', '#ef8b40', '#715ac0']
const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const total = (items: number[]) => items.reduce((sum, n) => sum + n, 0)
const quarterTotal = (months: number[], q: number) => total(months.slice(q * 3, q * 3 + 3))

function loadEntries(): Entry[] {
  try {
    const value = JSON.parse(localStorage.getItem('igp-partner-preview-entries') || '[]')
    return Array.isArray(value) ? value.filter((entry): entry is Entry => entry && typeof entry.partner === 'string' && Number.isFinite(entry.amount)) : []
  } catch { return [] }
}
function loadCounts(): NewCounts {
  try { const value = JSON.parse(localStorage.getItem('igp-partner-preview-new-counts') || '{}'); return value && typeof value === 'object' ? value : {} } catch { return {} }
}
function ring(values: number[], fallback: string) {
  const sum = total(values)
  if (!sum) return fallback
  let start = 0
  return `conic-gradient(${values.map((value, i) => {
    const from = start
    start += value / sum * 100
    return `${colors[i]} ${from}% ${start}%`
  }).join(', ')})`
}

export default function PartnerWorkspace({ partnerName, section }: { partnerName: string; section: string }) {
  const partner = snapshot.partners.find(p => p.name === partnerName) || snapshot.partners[0]
  const [entries, setEntries] = useState<Entry[]>(loadEntries)
  const [newCounts, setNewCounts] = useState<NewCounts>(loadCounts)
  const [kind, setKind] = useState<'received' | 'expense'>('expense')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => { localStorage.setItem('igp-partner-preview-entries', JSON.stringify(entries)) }, [entries])
  useEffect(() => { localStorage.setItem('igp-partner-preview-new-counts', JSON.stringify(newCounts)) }, [newCounts])
  const ownEntries = entries.filter(entry => entry.partner === partner.name)
  const budget = quarters.map((_, q) => quarterTotal(partner.schedule, q))
  const received = quarters.map((_, q) => quarterTotal(partner.received, q) + total(ownEntries.filter(e => e.quarter === q && e.kind === 'received').map(e => e.amount)))
  const expenses = quarters.map((_, q) => total(ownEntries.filter(e => e.quarter === q && e.kind === 'expense').map(e => e.amount)))
  const annualReceived = total(received), annualExpenses = total(expenses), annualBudget = total(budget)
  const selectedQuarter = /^q[1-4]$/.test(section) ? Number(section[1]) - 1 : -1
  const addEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = Number(amount)
    if (selectedQuarter < 0 || !date || !Number.isFinite(value) || value <= 0 || !description.trim()) return
    const month = Number(date.slice(5, 7))
    if (Number(date.slice(0, 4)) !== snapshot.year || month < selectedQuarter * 3 + 1 || month > selectedQuarter * 3 + 3) {
      setNotice(`Choose a date within ${quarters[selectedQuarter]} ${snapshot.year}.`)
      return
    }
    setEntries(previous => [...previous, { id: crypto.randomUUID(), partner: partner.name, quarter: selectedQuarter, kind, date, amount: value, description: description.trim() }])
    setAmount(''); setDescription(''); setNotice('Entry saved in this browser preview.')
  }
  const previewNote = <p className="partner-preview-note">Showing {partner.name} as the sample signed-in organisation. Real login and server-side partner restrictions are still to be built.</p>
  if (selectedQuarter < 0) return <>
    <div className="section-intro"><div><span className="eyebrow">PARTNER FINANCE · 2026</span><h2>{partner.name} dashboard</h2><p>Quarterly funding and expenses for this partner organisation.</p></div><span className="source-pill">Workbook + local preview entries</span></div>
    {previewNote}
    <div className="partner-dashboard-layout"><div className="partner-primary">
      <section className="surface"><div className="surface-head"><div><span className="eyebrow">YEAR AT A GLANCE</span><h3>Funds and expenses by quarter</h3></div><span>₹ INR</span></div><div className="table-scroll"><table><thead><tr><th>Quarter</th><th>Budget*</th><th>Funds received</th><th>Expenses</th></tr></thead><tbody>{quarters.map((q, i) => <tr key={q}><td><a className="partner-quarter-link" href={`#/partner/${q.toLowerCase()}`}>{q}</a></td><td>{money(budget[i])}</td><td>{money(received[i])}</td><td>{money(expenses[i])}</td></tr>)}</tbody><tfoot><tr><td>2026 total</td><td>{money(annualBudget)}</td><td>{money(annualReceived)}</td><td>{money(annualExpenses)}</td></tr></tfoot></table></div><p className="chart-foot">* Budget uses the partner’s scheduled transfers in the workbook. Expense entries are saved only in this browser preview.</p></section>
      <div className="partner-balance"><div className="stat-card teal"><span>Balance available</span><strong>{money(Math.max(annualReceived - annualExpenses, 0))}</strong><small>Funds received less recorded expenses, across all quarters</small></div><div className="stat-card orange"><span>Excess funds used</span><strong>{money(Math.max(annualExpenses - annualReceived, 0))}</strong><small>Recorded expenses above funds received, across all quarters</small></div></div>
    </div><div className="partner-secondary">
      <section className="surface"><div className="surface-head"><div><span className="eyebrow">PROGRAMME REACH</span><h3>No. of girls in the program</h3></div></div><div className="partner-girls">{[['CS', partner.cs], ['EA', partner.ea], ['ECC', partner.ecc], ['NEW', newCounts[partner.name]]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString('en-IN') : '—'}</strong></div>)}</div><p className="chart-foot">CS, EA and ECC: workbook snapshot. NEW: entered in quarter pages.</p></section>
      <section className="surface"><div className="surface-head"><div><span className="eyebrow">QUARTER SHARE</span><h3>Budget and expenses</h3></div></div><div className="partner-chart"><div className="partner-outer-ring" style={{ background: ring(expenses, '#e8edf3') }}><div className="partner-inner-ring" style={{ background: ring(budget, '#e8edf3') }}><div className="partner-ring-center"><b>2026</b><small>Q1–Q4</small></div></div></div></div><div className="partner-ring-key"><span><i className="ring-dot outer"/>Outer · expenses</span><span><i className="ring-dot inner"/>Inner · budget</span></div><div className="partner-legend">{quarters.map((q, i) => <div key={q}><i style={{ background: colors[i] }}/><b>{q}</b><span>{money(budget[i])} budget<br/>{money(expenses[i])} expenses</span></div>)}</div><p className="chart-foot">A grey outer ring means no expenses have been entered yet.</p></section>
    </div></div>
  </>
  const q = selectedQuarter
  const qEntries = ownEntries.filter(e => e.quarter === q).sort((a, b) => b.date.localeCompare(a.date))
  return <>
    <div className="section-intro"><div><span className="eyebrow">{partner.name} · 2026</span><h2>{quarters[q]} reporting</h2><p>{snapshot.months[q * 3]}–{snapshot.months[q * 3 + 2]} finances and data entry.</p></div><span className="source-pill">Local preview entries</span></div>
    {previewNote}
    <div className="stats-grid three"><div className="stat-card pink"><span>Quarter budget*</span><strong>{money(budget[q])}</strong><small>Scheduled transfers from workbook</small></div><div className="stat-card blue"><span>Funds received</span><strong>{money(received[q])}</strong><small>Workbook credits + preview entries</small></div><div className="stat-card orange"><span>Expenses</span><strong>{money(expenses[q])}</strong><small>Preview entries for this quarter</small></div></div>
    <div className="partner-quarter-grid"><section className="surface"><div className="surface-head"><div><span className="eyebrow">DATA ENTRY</span><h3>Add {quarters[q]} transaction</h3></div></div><form className="partner-entry-form" onSubmit={addEntry}><label>Entry type<select value={kind} onChange={e => setKind(e.target.value as 'received' | 'expense')}><option value="expense">Expense</option><option value="received">Funds received</option></select></label><label>Date<input required type="date" min={`${snapshot.year}-${String(q * 3 + 1).padStart(2, '0')}-01`} max={`${snapshot.year}-${String(q * 3 + 3).padStart(2, '0')}-31`} value={date} onChange={e => setDate(e.target.value)}/></label><label>Amount (₹)<input required type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"/></label><label className="full">Description<input required maxLength={160} value={description} onChange={e => setDescription(e.target.value)} placeholder="What was this for?"/></label><button className="button button-solid" type="submit">Save preview entry</button></form>{notice && <p className="partner-form-notice" role="status">{notice}</p>}<p className="chart-foot">Entries stay in this browser. They are not written to Excel or shared with other users.</p></section><section className="surface"><div className="surface-head"><div><span className="eyebrow">PROGRAMME COUNT</span><h3>NEW girls</h3></div></div><p className="partner-explainer">Enter the current NEW count for {partner.name}. This is one programme total, shown on the dashboard.</p><label className="partner-count-label">NEW count<input type="number" min="0" step="1" value={newCounts[partner.name] ?? ''} onChange={e => { const raw = e.target.value; setNewCounts(previous => { const next = { ...previous }; if (raw === '') delete next[partner.name]; else next[partner.name] = Math.max(0, Math.floor(Number(raw) || 0)); return next }) }} placeholder="Not entered"/></label><p className="chart-foot">CS, EA and ECC counts come from the workbook snapshot.</p></section></div>
    <section className="surface table-surface"><div className="surface-head"><div><span className="eyebrow">QUARTER DATA</span><h3>{quarters[q]} register</h3></div><span>{qEntries.length} preview entries</span></div><div className="table-scroll"><table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th></tr></thead><tbody>{qEntries.map(e => <tr key={e.id}><td>{e.date}</td><td>{e.kind === 'received' ? 'Funds received' : 'Expense'}</td><td>{e.description}</td><td>{money(e.amount)}</td></tr>)}{qEntries.length === 0 && <tr><td colSpan={4}>No preview entries yet for this quarter.</td></tr>}</tbody></table></div><p className="chart-foot">Workbook funds received in {quarters[q]}: {money(quarterTotal(partner.received, q))}. These source credits are included in the summary above.</p></section>
  </>
}
