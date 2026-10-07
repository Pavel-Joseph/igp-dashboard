import { useDashboardData } from './data/SnapshotContext'

const money = (n: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(n)

export default function LivePartnerWorkspace({ partnerName, section }: { partnerName: string; section: string }) {
  const data = useDashboardData()
  const partner = data.partners.find(item => item.name === partnerName)
  if (!partner) return <section className="surface"><h2>No partner assigned</h2><p>Ask the administrator to assign your account to an organisation.</p></section>
  const quarters = [0, 1, 2, 3].map(index => ({
    label: `Q${index + 1}`,
    budget: partner.schedule.slice(index * 3, index * 3 + 3).reduce((sum, n) => sum + n, 0),
  }))
  const selected = /^q[1-4]$/.test(section) ? Number(section[1]) - 1 : -1
  const rows = selected < 0
    ? quarters
    : [quarters[selected]]
  return <>
    <div className="section-intro"><div><span className="eyebrow">PARTNER WORKSPACE · 2026</span>
      <h2>{partner.name} {selected < 0 ? 'dashboard' : quarters[selected].label}</h2>
      <p>Your own organisation's verified grant and scheduled funding.</p></div>
      <span className="source-pill">Live database</span></div>
    <div className="stats-grid three">
      <div className="stat-card pink"><span>Final grant</span><strong>{money(partner.finalGrant)}</strong><small>2026 approved grant</small></div>
      <div className="stat-card blue"><span>Scheduled transfers</span><strong>{money(quarters.reduce((sum, q) => sum + q.budget, 0))}</strong><small>Verified amounts only</small></div>
      <div className="stat-card teal"><span>Funds received / expenses</span><strong>—</strong><small>No entry records in the supplied workbook</small></div>
    </div>
    <section className="surface table-surface"><div className="surface-head"><h3>{selected < 0 ? 'Quarterly schedule' : quarters[selected].label + ' schedule'}</h3><span>Planned funding</span></div>
      <div className="table-scroll"><table><thead><tr><th>Quarter</th><th>Scheduled amount</th><th>Funds received</th><th>Expenses</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.label}><td><b>{row.label}</b></td><td>{money(row.budget)}</td><td>—</td><td>—</td></tr>)}</tbody></table></div>
      <p className="chart-foot">Blank receipt and expense figures are unavailable, not zero. Two schedule cells linked to an external workbook remain unverified.</p>
    </section>
    <section className="surface"><div className="surface-head"><h3>Girls in the programme</h3></div>
      <div className="partner-girls">{[['CS', partner.cs], ['EA', partner.ea], ['ECC', partner.ecc], ['NEW', undefined]].map(([label, value]) =>
        <div key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString('en-IN') : '—'}</strong></div>)}</div>
      <p className="chart-foot">NEW counts were not supplied in the admin workbook.</p>
    </section>
    {selected >= 0 && <section className="surface"><h3>Quarter entry form</h3><p>The database needs a partner transaction table and final approval rules before entries can be saved here. This page is read-only for now.</p></section>}
  </>
}
