import snapshot from './data/workbookSnapshot.json'

const partnerNames = ['JJS', 'BHS', 'CHF', 'KMVS'] as const
const format = (value: number | undefined) => value === undefined ? '—' : value.toLocaleString('en-IN')

export default function ApeDashboard() {
  const rows = partnerNames.map(name => {
    const source = snapshot.partners.find(partner => partner.name === name)
    return { name, target: source?.apeTarget || undefined, ycm: undefined, pat: undefined, ddf: undefined, achieved: undefined }
  })
  const knownTargets = rows.filter(row => row.target !== undefined)
  const targetTotal = knownTargets.reduce((sum, row) => sum + (row.target ?? 0), 0)

  return <>
    <div className="section-intro"><div><span className="eyebrow">AWARENESS & PREVENTIVE EDUCATION · 2026</span><h2>APE dashboard</h2><p>Targets and programme outcomes for JJS, BHS, CHF and KMVS.</p></div><span className="source-pill">2026 workbook snapshot</span></div>
    <div className="ape-intro-grid"><section className="ape-highlight"><span>REPORTED TARGET</span><strong>{format(targetTotal)}</strong><p>Available for {knownTargets.length} of {partnerNames.length} requested partners</p></section><section className="ape-coverage"><div><span>Partners in this view</span><strong>{partnerNames.length}</strong></div><div><span>Targets sourced</span><strong>{knownTargets.length}</strong></div><div><span>Achievements sourced</span><strong>—</strong></div></section></div>
    <section className="surface table-surface ape-table"><div className="surface-head"><div><span className="eyebrow">PARTNER BREAKDOWN</span><h3>Target and results by partner</h3></div><span>2026</span></div><div className="table-scroll"><table><thead><tr><th>Partner</th><th>Target</th><th>YCM</th><th>PAT</th><th>DDF</th><th>Achieved</th></tr></thead><tbody>{rows.map(row => <tr key={row.name}><td><b>{row.name}</b></td><td>{format(row.target)}</td><td>{format(row.ycm)}</td><td>{format(row.pat)}</td><td>{format(row.ddf)}</td><td>{format(row.achieved)}</td></tr>)}</tbody><tfoot><tr><td>Reported total</td><td>{format(targetTotal)}</td><td>—</td><td>—</td><td>—</td><td>—</td></tr></tfoot></table></div><p className="chart-foot">A dash means the programme figure is not available in the current workbook snapshot. The target total includes only JJS and BHS. Budget line items named PAT and DDF are not used as programme results.</p></section>
    <section className="surface ape-targets"><div className="surface-head"><div><span className="eyebrow">TARGET COVERAGE</span><h3>Available targets by partner</h3></div></div><div className="ape-target-list">{rows.map(row => <div key={row.name}><span>{row.name}</span><div><i style={{ width: row.target ? `${row.target / Math.max(...knownTargets.map(item => item.target ?? 0), 1) * 100}%` : '0%' }}/></div><strong>{format(row.target)}</strong></div>)}</div><p className="chart-foot">This chart shows only targets found in the supplied workbook. Achieved values cannot be calculated until outcome data is supplied.</p></section>
  </>
}
