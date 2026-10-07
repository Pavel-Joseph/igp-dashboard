import { useDashboardData, useLiveMode } from './data/SnapshotContext'

type NewCounts = Record<string, number>

function readNewCounts(): NewCounts {
  try {
    const stored = JSON.parse(localStorage.getItem('igp-partner-preview-new-counts') || '{}')
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {}
    return Object.fromEntries(Object.entries(stored).filter(([, value]) => typeof value === 'number' && Number.isInteger(value) && value >= 0)) as NewCounts
  } catch { return {} }
}

const count = (value: number) => value.toLocaleString('en-IN')
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export default function ChildSponsorDashboard() {
  const snapshot = useDashboardData()
  const live = useLiveMode()
  const newCounts = live ? {} : readNewCounts()
  const rows = snapshot.partners.map(partner => {
    const newGirls = newCounts[partner.name]
    return { ...partner, newGirls, total: partner.ecc + partner.cs + partner.ea + (newGirls ?? 0) }
  })
  const totals = {
    ecc: sum(rows.map(row => row.ecc)),
    cs: sum(rows.map(row => row.cs)),
    ea: sum(rows.map(row => row.ea)),
    newGirls: sum(rows.map(row => row.newGirls ?? 0)),
    all: sum(rows.map(row => row.total)),
  }
  const reportedNew = rows.filter(row => row.newGirls !== undefined).length
  const max = Math.max(...rows.map(row => row.total), 1)

  return <>
    <div className="section-intro"><div><span className="eyebrow">CHILD SPONSORSHIP · 2026</span><h2>Girls in the programme</h2><p>Programme counts by partner, with a reported total for each organisation.</p></div><span className="source-pill">{live ? 'Live database' : '2026 workbook snapshot'}</span></div>
    <div className="sponsor-summary">
      <div className="stat-card pink"><span>Child Sponsorship · CS</span><strong>{count(totals.cs)}</strong><small>Across {rows.length} partners</small></div>
      <div className="stat-card blue"><span>Education Assistance · EA</span><strong>{count(totals.ea)}</strong><small>Workbook count</small></div>
      <div className="stat-card teal"><span>Early Child Care · ECC</span><strong>{count(totals.ecc)}</strong><small>Workbook count</small></div>
      <div className="stat-card orange"><span>NEW girls</span><strong>{reportedNew ? count(totals.newGirls) : '—'}</strong><small>{reportedNew ? `Reported for ${reportedNew} of ${rows.length} partners` : 'Not present in workbook'}</small></div>
    </div>
    <section className="sponsor-total-banner"><div><span>TOTAL REPORTED PROGRAMME COUNT</span><strong>{count(totals.all)}</strong><p>Sum of the reported CS, EA and ECC programme counts. NEW is not yet supplied.</p></div><span className="sponsor-total-mark">{rows.length} partner organisations</span></section>
    <section className="surface table-surface sponsor-table"><div className="surface-head"><div><span className="eyebrow">PARTNER BREAKDOWN</span><h3>Girls by programme and partner</h3></div><span>{rows.length} partners</span></div><div className="table-scroll"><table><thead><tr><th>Partner</th><th>ECC</th><th>CS</th><th>EA</th><th>NEW</th><th>Total reported</th></tr></thead><tbody>{rows.map(row => <tr key={row.name}><td><b>{row.name}</b></td><td>{count(row.ecc)}</td><td>{count(row.cs)}</td><td>{count(row.ea)}</td><td>{row.newGirls === undefined ? '—' : count(row.newGirls)}</td><td><b>{count(row.total)}</b></td></tr>)}</tbody><tfoot><tr><td>All partners</td><td>{count(totals.ecc)}</td><td>{count(totals.cs)}</td><td>{count(totals.ea)}</td><td>{reportedNew ? count(totals.newGirls) : '—'}</td><td>{count(totals.all)}</td></tr></tfoot></table></div><p className="chart-foot">A dash means NEW has not been reported. Totals add only reported values; they do not treat an unreported count as confirmed zero. These are sums of programme categories, not verified unique individuals. NEW values are not yet available in the database.</p></section>
    <section className="surface sponsor-reach"><div className="surface-head"><div><span className="eyebrow">PARTNER COMPARISON</span><h3>Reported girls by partner</h3></div></div><div className="sponsor-reach-list">{rows.map(row => <div key={row.name}><span>{row.name}</span><div className="sponsor-track"><i className="ecc" style={{ width: `${row.ecc / max * 100}%` }}/><i className="cs" style={{ width: `${row.cs / max * 100}%` }}/><i className="ea" style={{ width: `${row.ea / max * 100}%` }}/><i className="new" style={{ width: `${(row.newGirls ?? 0) / max * 100}%` }}/></div><b>{count(row.total)}</b></div>)}</div><div className="sponsor-legend"><span><i className="ecc"/> ECC</span><span><i className="cs"/> CS</span><span><i className="ea"/> EA</span><span><i className="new"/> NEW</span></div></section>
  </>
}
