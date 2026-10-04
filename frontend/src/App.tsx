import { useEffect, useState } from 'react'
import snapshot from './data/workbookSnapshot.json'
import PartnerWorkspace from './PartnerWorkspace'
import ChildSponsorDashboard from './ChildSponsorDashboard'
import ApeDashboard from './ApeDashboard'

type Role = 'admin' | 'sponsor' | 'ape' | 'partner'
type Section = 'dashboard' | 'grants' | 'schedule' | 'received' | 'office'
type IconName = 'grid' | 'grant' | 'calendar' | 'received' | 'office' | 'arrow' | 'shield' | 'heart' | 'users' | 'book' | 'logout' | 'check' | 'menu' | 'close'

const roleLabels: Record<Role, string> = {
  admin: 'Admin', sponsor: 'Child Sponsor', ape: 'Awareness & Preventive Education', partner: 'Partners Login',
}
const sections: { id: Section; label: string; icon: IconName; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', description: '2026 programme and finance overview' },
  { id: 'grants', label: 'Partners Grant', icon: 'grant', description: 'Budget and final grant by partner' },
  { id: 'schedule', label: 'Partners Schedule', icon: 'calendar', description: 'Monthly planned transfers' },
  { id: 'received', label: 'Funds Received', icon: 'received', description: 'Recorded credits by partner' },
  { id: 'office', label: 'India Office Management', icon: 'office', description: 'Office expenses and categories' },
]
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const rupees = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
const compact = (value: number) => value >= 10_000_000 ? `₹${(value / 10_000_000).toFixed(2)} cr` : value >= 100_000 ? `₹${(value / 100_000).toFixed(2)} L` : rupees(value)

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    grant: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 15h4M16 14h2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h3m-3 4h3m4-4h3"/></>,
    received: <><path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/></>,
    office: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2m4 0h1M9 11h2m4 0h1M9 15h2m4 0h1M11 21v-3h2v3"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    shield: <><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    heart: <><path d="M20.8 8.6c0 4.1-5.9 8.4-8.8 10.8-2.9-2.4-8.8-6.7-8.8-10.8a5 5 0 0 1 8.8-3.2 5 5 0 0 1 8.8 3.2Z"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3Zm13-14a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5h-3"/></>,
    book: <><path d="M4 4h7a3 3 0 0 1 3 3v14H7a3 3 0 0 0-3 0V4Zm16 0h-3a3 3 0 0 0-3 3v14h3a3 3 0 0 1 3 0V4Z"/></>,
    logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m5-4 4-4-4-4m4 4H9"/></>,
    check: <path d="m4 12 5 5L20 6"/>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    close: <path d="M5 5 19 19M19 5 5 19"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function useRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(read)
  useEffect(() => { const onChange = () => setRoute(read()); window.addEventListener('hashchange', onChange); return () => window.removeEventListener('hashchange', onChange) }, [])
  return route
}
function go(path: string) { window.location.hash = path; window.scrollTo({ top: 0, behavior: 'smooth' }) }

function Landing() {
  const today = new Date()
  const day = new Intl.DateTimeFormat('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' }).format(today)
  const month = new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' }).format(today)
  const year = new Intl.DateTimeFormat('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(today)
  return <div className="landing">
    <header className="public-header"><div className="public-header-inner"><a className="wordmark" href="#/"><span className="mark">IGP</span><span>Invisible Girl Project<small>Programme & finance workspace</small></span></a><nav><button className="button button-solid" onClick={() => go('/login')}>Login <Icon name="arrow" size={17}/></button></nav></div></header>
    <main className="landing-main">
      <img className="hero-image" src="/landing-background.png" alt="" aria-hidden="true" />
      <div className="landing-image-shade" aria-hidden="true" />
      <div className="hero-copy">
        <h1>IGP INDIA FINANCE DASHBOARD</h1>
        <p>We want a future in India with girls in it</p>
        <div className="hero-actions"><button className="button button-solid button-large" onClick={() => go('/login')}>Open dashboard preview <Icon name="arrow" size={19}/></button><span>Frontend preview · no live sign-in yet</span></div>
        <div className="hero-stats"><div><b>{day}</b><span>Day</span></div><div><b>{month}</b><span>Month</span></div><div><b>{year}</b><span>Year</span></div></div>
      </div>
    </main>
    <footer className="public-footer">IGP India Dashboard · Frontend preview based on the 2026 workbook</footer>
  </div>
}

function Login({ onEnter }: { onEnter: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role>('admin')
  const choices: { role: Role; icon: IconName; text: string }[] = [
    { role: 'admin', icon: 'shield', text: 'Full dashboard and management overview' },
    { role: 'sponsor', icon: 'heart', text: 'Child sponsorship workspace preview' },
    { role: 'ape', icon: 'book', text: 'Awareness and education workspace preview' },
    { role: 'partner', icon: 'users', text: 'Partner organisation workspace preview' },
  ]
  return <div className="login-page"><div className="login-left"><a className="wordmark light" href="#/"><span className="mark">IGP</span><span>Invisible Girl Project<small>Programme & finance workspace</small></span></a><div className="login-message"><span className="overline">IGP INDIA · 2026</span><h1>Welcome back to your workspace.</h1><p>Choose a workspace to preview how each login will enter the dashboard.</p></div><div className="login-visual"><span>2026 FINANCIAL DASHBOARD</span><div className="login-visual-bars"><i/><i/><i/><i/><i/><i/><i/></div><small>Partner programme overview</small></div></div><main className="login-right"><div className="login-content"><button className="text-link" onClick={() => go('/')}><span>←</span> Back to home</button><span className="overline pink">WORKSPACE ACCESS</span><h2>Choose your login</h2><p>Select a role to see its frontend preview. Real authentication will be connected with the backend.</p><div className="role-list">{choices.map(choice => <button key={choice.role} className={`role-choice ${selected === choice.role ? 'selected' : ''}`} onClick={() => setSelected(choice.role)}><span className="role-icon"><Icon name={choice.icon}/></span><span><b>{roleLabels[choice.role]}</b><small>{choice.text}</small></span><span className="radio-dot"/></button>)}</div><button className="button button-solid continue" onClick={() => onEnter(selected)}>Continue to preview <Icon name="arrow" size={18}/></button><div className="login-note"><Icon name="shield" size={16}/> Preview mode. No password or account data is collected.</div></div></main></div>
}

function StatCard({ label, value, detail, tone = 'blue' }: { label: string; value: string; detail: string; tone?: 'blue' | 'pink' | 'orange' | 'teal' }) {
  return <div className={`stat-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
}

function Bars({ data, color = 'orange', maxHeight = 210 }: { data: { label: string; value: number }[]; color?: 'orange' | 'blue' | 'pink'; maxHeight?: number }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return <div className={`bars bars-${color}`} style={{ height: maxHeight + 54 }}>{data.map((item, i) => <div className="bar-column" key={`${item.label}-${i}`} title={`${item.label}: ${rupees(item.value)}`}><div className="bar-track"><div className="bar-fill" style={{ height: `${item.value ? Math.max(3, item.value / max * 100) : 0}%` }}/></div><span>{item.label}</span></div>)}</div>
}

function Donut({ data }: { data: { name: string; value: number }[] }) {
  const colors = ['#a72579', '#e56a37', '#1b9ac3', '#185387', '#6e5bc5', '#e7ae2d', '#5fba94', '#8f68ad', '#3b75c8', '#a8c35c']
  const total = sum(data.map(item => item.value))
  let at = 0
  const stops = data.map((item, i) => { const start = at; at += item.value / total * 100; return `${colors[i % colors.length]} ${start}% ${at}%` }).join(', ')
  return <div className="donut-row"><div className="donut" style={{ background: `conic-gradient(${stops})` }}><div><small>Final grants</small><strong>{compact(total)}</strong></div></div><div className="donut-legend">{data.slice(0, 7).map((item, i) => <div key={item.name}><i style={{ background: colors[i] }}/><span>{item.name}</span><b>{compact(item.value)}</b></div>)}{data.length > 7 && <small>+ {data.length - 7} more partners</small>}</div></div>
}

function Dashboard() {
  const grantTotal = sum(snapshot.partners.map(p => p.finalGrant))
  const scheduleTotal = sum(snapshot.partners.flatMap(p => p.schedule))
  const receivedTotal = sum(snapshot.partners.flatMap(p => p.received))
  const counts = [{ label: 'CS', value: sum(snapshot.partners.map(p => p.cs)) }, { label: 'EA', value: sum(snapshot.partners.map(p => p.ea)) }, { label: 'ECC', value: sum(snapshot.partners.map(p => p.ecc)) }]
  const ape = snapshot.partners.filter(p => p.apeTarget > 0).map(p => ({ label: p.name, value: p.apeTarget }))
  return <><div className="section-intro"><div><span className="eyebrow">FINANCIAL OVERVIEW</span><h2>Dashboard</h2><p>Programme budgets, partner support and scheduled funding for 2026.</p></div><span className="source-pill">2026 workbook snapshot</span></div><div className="stats-grid"><StatCard label="Total programme budget" value={compact(snapshot.workbookTotals.budget)} detail="Before prior-year adjustments" tone="pink"/><StatCard label="Final partner grants" value={compact(grantTotal)} detail="Across 10 partners" tone="blue"/><StatCard label="Planned transfers" value={compact(scheduleTotal)} detail="January to December" tone="orange"/><StatCard label="Funds recorded" value={compact(receivedTotal)} detail="From Credit Data sheet" tone="teal"/></div><div className="dashboard-grid"><section className="surface allocation"><div className="surface-head"><div><span className="eyebrow">PARTNER DISTRIBUTION</span><h3>2026 final grants</h3></div><button className="mini-link" onClick={() => go('/admin/grants')}>View grants <Icon name="arrow" size={16}/></button></div><Donut data={snapshot.partners.map(p => ({ name: p.name, value: p.finalGrant }))}/></section><section className="surface"><div className="surface-head"><div><span className="eyebrow">PROGRAMME REACH</span><h3>People in the programme</h3></div></div><div className="count-chart">{counts.map((item, i) => <div key={item.label}><span>{item.label}</span><div><i style={{ width: `${item.value / Math.max(...counts.map(c => c.value), 1) * 100}%`, background: ['#e56a57', '#229cc8', '#8bc5dc'][i] }}/></div><strong>{item.value.toLocaleString('en-IN')}</strong></div>)}</div><p className="chart-foot">Counts come from the Partners Index sheet.</p></section><section className="surface"><div className="surface-head"><div><span className="eyebrow">AWARENESS & EDUCATION</span><h3>APE target by partner</h3></div></div><Bars data={ape} color="blue" maxHeight={180}/><p className="chart-foot">Total target: {sum(ape.map(a => a.value)).toLocaleString('en-IN')}</p></section><section className="surface"><div className="surface-head"><div><span className="eyebrow">UPCOMING ACTIVITY</span><h3>Monthly transfer schedule</h3></div><button className="mini-link" onClick={() => go('/admin/schedule')}>Full schedule <Icon name="arrow" size={16}/></button></div><Bars data={snapshot.months.map((m, i) => ({ label: m.slice(0, 3), value: sum(snapshot.partners.map(p => p.schedule[i])) }))} maxHeight={180}/></section></div></>
}

function Grants() {
  const [selected, setSelected] = useState('All partners')
  const partners = selected === 'All partners' ? snapshot.partners : snapshot.partners.filter(p => p.name === selected)
  const budget = sum(partners.map(p => p.budget)), final = sum(partners.map(p => p.finalGrant))
  const current = selected === 'All partners' ? null : partners[0]
  return <><PageHeading eyebrow="PARTNER FINANCE" title="Partners Grant" description="Compare 2026 approved budgets with final grant amounts after adjustments."/><div className="toolbar"><label>Partner<select value={selected} onChange={e => setSelected(e.target.value)}><option>All partners</option>{snapshot.partners.map(p => <option key={p.name}>{p.name}</option>)}</select></label><span className="toolbar-note">Source: Core Data · Partners Index</span></div><div className="stats-grid three"><StatCard label="Original budget" value={compact(budget)} detail="2026 grant budget" tone="pink"/><StatCard label="Final grant" value={compact(final)} detail="After adjustments" tone="blue"/><StatCard label="Adjustment" value={compact(final - budget)} detail="Final grant minus budget" tone="orange"/></div><div className="content-grid"><section className="surface"><div className="surface-head"><h3>Budget by partner</h3><span>2026</span></div><Bars data={partners.map(p => ({ label: p.name, value: p.finalGrant }))} maxHeight={250}/></section><section className="surface detail-card"><span className="eyebrow">{current ? `${current.name} DETAILS` : 'ALL PARTNERS'}</span><h3>{current ? 'Programme profile' : 'Grant overview'}</h3>{current ? <div className="detail-list"><div><span>Child sponsorship</span><b>{current.cs.toLocaleString('en-IN')}</b></div><div><span>Early child care</span><b>{current.ecc.toLocaleString('en-IN')}</b></div><div><span>Education assistance</span><b>{current.ea.toLocaleString('en-IN')}</b></div><div><span>Social workers</span><b>{current.socialWorkers.toLocaleString('en-IN')}</b></div><div><span>APE target</span><b>{current.apeTarget.toLocaleString('en-IN')}</b></div></div> : <><p>Select a partner to view the programme counts behind its budget.</p><div className="detail-highlight"><span>Partners in this view</span><strong>{snapshot.partners.length}</strong></div></>}</section></div><section className="surface table-surface"><div className="surface-head"><h3>Grant register</h3><span>{partners.length} partners</span></div><div className="table-scroll"><table><thead><tr><th>Partner</th><th>Original budget</th><th>Adjustment</th><th>Final grant</th><th>Scheduled</th></tr></thead><tbody>{partners.map(p => <tr key={p.name} onClick={() => setSelected(p.name)}><td><b>{p.name}</b></td><td>{rupees(p.budget)}</td><td className={p.finalGrant - p.budget < 0 ? 'negative' : ''}>{rupees(p.finalGrant - p.budget)}</td><td><b>{rupees(p.finalGrant)}</b></td><td>{rupees(sum(p.schedule))}</td></tr>)}</tbody><tfoot><tr><td>Total</td><td>{rupees(budget)}</td><td>{rupees(final - budget)}</td><td>{rupees(final)}</td><td>{rupees(sum(partners.flatMap(p => p.schedule)))}</td></tr></tfoot></table></div></section></>
}

function Schedule() {
  const [month, setMonth] = useState(6)
  const rows = snapshot.partners.map(p => ({ name: p.name, amount: p.schedule[month] }))
  const total = sum(rows.map(r => r.amount))
  const annual = sum(snapshot.partners.flatMap(p => p.schedule))
  return <><PageHeading eyebrow="PARTNER FINANCE" title="Partners Schedule" description="See how planned partner transfers are distributed through 2026."/><div className="toolbar"><label>Reporting month<select value={month} onChange={e => setMonth(Number(e.target.value))}>{snapshot.months.map((m, i) => <option value={i} key={m}>{m}</option>)}</select></label><span className="toolbar-note">Source: Partners Funds</span></div><div className="stats-grid three"><StatCard label={`${snapshot.months[month]} schedule`} value={compact(total)} detail="Planned for selected month" tone="pink"/><StatCard label="Full-year schedule" value={compact(annual)} detail="All partner instalments" tone="blue"/><StatCard label="Partners scheduled" value={String(rows.filter(r => r.amount > 0).length)} detail={`In ${snapshot.months[month]}`} tone="orange"/></div><div className="content-grid wide-main"><section className="surface"><div className="surface-head"><h3>{snapshot.months[month]} by partner</h3><span>{rupees(total)} total</span></div><Bars data={rows.map(r => ({ label: r.name, value: r.amount }))} maxHeight={300}/></section><section className="surface"><h3>Year at a glance</h3><div className="month-list">{snapshot.months.map((m, i) => { const amount = sum(snapshot.partners.map(p => p.schedule[i])); return <button key={m} className={i === month ? 'active' : ''} onClick={() => setMonth(i)}><span>{m.slice(0, 3)}</span><i style={{ width: `${amount / 5_400_000 * 100}%` }}/><b>{compact(amount)}</b></button> })}</div></section></div><section className="surface table-surface"><div className="surface-head"><h3>{snapshot.months[month]} transfer detail</h3><span>Scheduled instalments</span></div><div className="table-scroll"><table><thead><tr><th>Partner</th><th>Scheduled amount</th><th>Share of month</th></tr></thead><tbody>{rows.map(r => <tr key={r.name}><td><b>{r.name}</b></td><td>{rupees(r.amount)}</td><td>{total ? (r.amount / total * 100).toFixed(1) : '0.0'}%</td></tr>)}</tbody></table></div></section></>
}

function Received() {
  const [month, setMonth] = useState(0)
  const rows = snapshot.partners.map(p => ({ name: p.name, amount: p.received[month], scheduled: p.schedule[month] }))
  const received = sum(rows.map(r => r.amount)), scheduled = sum(rows.map(r => r.scheduled))
  const yearReceived = sum(snapshot.partners.flatMap(p => p.received))
  return <><PageHeading eyebrow="FUND TRACKING" title="Funds Received" description="Review credits recorded in the workbook by month and partner."/><div className="toolbar"><label>Reporting month<select value={month} onChange={e => setMonth(Number(e.target.value))}>{snapshot.months.map((m, i) => <option value={i} key={m}>{m}</option>)}</select></label><span className="toolbar-note">Preview mapping: Credit Data sheet</span></div><div className="stats-grid three"><StatCard label={`${snapshot.months[month]} recorded`} value={compact(received)} detail="Credits entered in workbook" tone="pink"/><StatCard label={`${snapshot.months[month]} scheduled`} value={compact(scheduled)} detail="Planned partner transfers" tone="blue"/><StatCard label="Recorded across 2026" value={compact(yearReceived)} detail="All workbook credit entries" tone="teal"/></div><div className="content-grid wide-main"><section className="surface"><div className="surface-head"><h3>Credits by partner</h3><span>{snapshot.months[month]}</span></div><Bars data={rows.map(r => ({ label: r.name, value: r.amount }))} color="blue" maxHeight={285}/>{received === 0 && <p className="chart-foot">No credits are entered for this month in the workbook snapshot.</p>}</section><section className="surface"><h3>Recorded by month</h3><div className="month-list">{snapshot.months.map((m, i) => { const amount = sum(snapshot.partners.map(p => p.received[i])); return <button key={m} className={i === month ? 'active' : ''} onClick={() => setMonth(i)}><span>{m.slice(0, 3)}</span><i style={{ width: `${amount / Math.max(yearReceived, 1) * 100}%` }}/><b>{compact(amount)}</b></button> })}</div></section></div><section className="surface table-surface"><div className="surface-head"><h3>{snapshot.months[month]} partner detail</h3><span>Credits and planned transfers</span></div><div className="table-scroll"><table><thead><tr><th>Partner</th><th>Recorded credit</th><th>Scheduled transfer</th><th>Difference</th></tr></thead><tbody>{rows.map(r => <tr key={r.name}><td><b>{r.name}</b></td><td>{rupees(r.amount)}</td><td>{rupees(r.scheduled)}</td><td>{rupees(r.amount - r.scheduled)}</td></tr>)}</tbody></table></div></section></>
}

function Office() {
  const [month, setMonth] = useState(1)
  const expenses = snapshot.expenses.map(e => ({ category: e.category, amount: e.monthly[month] }))
  const total = sum(expenses.map(e => e.amount))
  const year = sum(snapshot.expenses.flatMap(e => e.monthly))
  const largest = [...expenses].sort((a, b) => b.amount - a.amount)[0]
  return <><PageHeading eyebrow="INDIA OFFICE" title="India Office Management" description="Monitor petty cash and operational expenses by category."/><div className="toolbar"><label>Reporting month<select value={month} onChange={e => setMonth(Number(e.target.value))}>{snapshot.months.map((m, i) => <option value={i} key={m}>{m}</option>)}</select></label><span className="toolbar-note">Source: Petty Cash Index</span></div><div className="stats-grid three"><StatCard label={`${snapshot.months[month]} expenses`} value={compact(total)} detail="Recorded office costs" tone="pink"/><StatCard label="Annual recorded expenses" value={compact(year)} detail="All categories and months" tone="blue"/><StatCard label="Largest category" value={largest?.category || '—'} detail={largest ? rupees(largest.amount) : 'No entries'} tone="orange"/></div><section className="surface office-chart"><div className="surface-head"><h3>{snapshot.months[month]} category spending</h3><span>{expenses.length} categories</span></div><Bars data={expenses.map(e => ({ label: e.category, value: e.amount }))} color="blue" maxHeight={300}/></section><section className="surface table-surface"><div className="surface-head"><h3>Expense register</h3><span>{snapshot.months[month]}</span></div><div className="table-scroll"><table><thead><tr><th>Category</th><th>Selected month</th><th>2026 total</th></tr></thead><tbody>{snapshot.expenses.map(e => <tr key={e.category}><td><b>{e.category}</b></td><td>{rupees(e.monthly[month])}</td><td>{rupees(sum(e.monthly))}</td></tr>)}</tbody><tfoot><tr><td>Total</td><td>{rupees(total)}</td><td>{rupees(year)}</td></tr></tfoot></table></div></section></>
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="section-intro"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div><span className="source-pill">2026 workbook snapshot</span></div>
}

function Workspace({ role, onExit }: { role: Role; onExit: () => void }) {
  const route = useRoute()
  const section = (route.split('/')[2] || 'dashboard') as Section
  const active = sections.some(s => s.id === section) ? section : 'dashboard'
  const partnerSection = /^(dashboard|q[1-4])$/.test(section) ? section : 'dashboard'
  const [menuOpen, setMenuOpen] = useState(false)
  const partnerName = 'RAISE'
  const title = role === 'admin' ? sections.find(s => s.id === active)?.label : role === 'partner' ? partnerSection.toUpperCase() : 'Dashboard'
  return <div className="workspace"><aside className={`sidebar ${menuOpen ? 'open' : ''}`}><div className="side-brand"><span className="mark">IGP</span><span>IGP India<small>Financial Dashboard 2026</small></span><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close"/></button></div><div className="side-label">WORKSPACE</div><nav>{role === 'admin' ? sections.map(item => <a key={item.id} href={`#/admin/${item.id}`} onClick={() => setMenuOpen(false)} className={active === item.id ? 'active' : ''}><Icon name={item.icon} size={19}/><span>{item.label}</span></a>) : role === 'partner' ? ['dashboard', 'q1', 'q2', 'q3', 'q4'].map(item => <a key={item} href={`#/partner/${item}`} onClick={() => setMenuOpen(false)} className={partnerSection === item ? 'active' : ''}><Icon name={item === 'dashboard' ? 'grid' : 'calendar'} size={19}/><span>{item === 'dashboard' ? 'Dashboard' : item.toUpperCase()}</span></a>) : <a href={`#/${role}/dashboard`} className="active"><Icon name="grid" size={19}/><span>Dashboard</span></a>}</nav><div className="side-bottom"><div className="side-source"><span className="source-light"/><div>Workbook preview<small>{role === 'partner' ? 'Workbook + local entries' : 'Read-only data snapshot'}</small></div></div><button onClick={onExit}><Icon name="logout" size={18}/> Exit preview</button></div></aside><div className="workspace-main"><header className="workspace-top"><div className="top-left"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu"/></button><span>IGP India</span><span className="chevron">/</span><b>{title}</b></div><div className="top-right"><span className="year-pill">2026</span><div className="avatar">{role === 'admin' ? 'AD' : role === 'partner' ? 'PT' : role === 'sponsor' ? 'CS' : 'AP'}</div><div className="account-name"><b>{roleLabels[role]}</b><small>Preview mode</small></div></div></header><main className="workspace-content"><div className="preview-banner"><Icon name="shield" size={17}/><span>Frontend preview. Workbook figures are static; partner entries save only in this browser. Authentication and Excel sync are not connected yet.</span></div>{role === 'admin' ? active === 'dashboard' ? <Dashboard/> : active === 'grants' ? <Grants/> : active === 'schedule' ? <Schedule/> : active === 'received' ? <Received/> : <Office/> : role === 'partner' ? <PartnerWorkspace partnerName={partnerName} section={partnerSection}/> : role === 'sponsor' ? <ChildSponsorDashboard/> : <ApeDashboard/>}<footer className="workspace-footer">IGP India Dashboard · 2026 workbook preview</footer></main></div>{menuOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)}/>}</div>
}

export default function App() {
  const route = useRoute()
  const [role, setRole] = useState<Role>(() => { const value = sessionStorage.getItem('igp-preview-role'); return value && value in roleLabels ? value as Role : 'admin' })
  const enter = (next: Role) => { sessionStorage.setItem('igp-preview-role', next); setRole(next); go(`/${next}/dashboard`) }
  const exit = () => { sessionStorage.removeItem('igp-preview-role'); go('/login') }
  if (route === '/' || route === '/about') return <Landing/>
  if (route === '/login') return <Login onEnter={enter}/>
  const pathRole = route.split('/')[1] as Role
  if (pathRole in roleLabels) return <Workspace role={pathRole === role ? role : pathRole} onExit={exit}/>
  return <Landing/>
}
