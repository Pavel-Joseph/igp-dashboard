import { supabase } from '../lib/supabase'
import { months, type DashboardData } from './SnapshotContext'

type PartnerRow = { id: string; code: string; name: string }
type GrantRow = { partner_id: string; entered_total: number | null; entered_effective_grant: number | null }
type MetricRow = { partner_id: string; metric: string; value: number }
type ScheduleRow = { partner_id: string; month: number; amount: number | null; verification_status: string }
type CashRow = { category: string; month: number; amount: number }

function requireData<T>(result: { data: T | null; error: { message: string } | null }, table: string): T {
  if (result.error) throw new Error(`${table}: ${result.error.message}`)
  if (result.data === null) throw new Error(`${table}: no response`)
  return result.data
}

export async function loadDashboardData(): Promise<DashboardData> {
  if (!supabase) throw new Error('Supabase is not configured')
  const [partnersResult, grantsResult, metricsResult, schedulesResult, cashResult] = await Promise.all([
    supabase.from('partners').select('id,code,name').order('name'),
    supabase.from('partner_grants').select('partner_id,entered_total,entered_effective_grant').eq('fiscal_year', 2026),
    supabase.from('partner_metrics').select('partner_id,metric,value').eq('fiscal_year', 2026),
    supabase.from('partner_schedules').select('partner_id,month,amount,verification_status').eq('fiscal_year', 2026),
    supabase.from('petty_cash_monthly').select('category,month,amount').eq('fiscal_year', 2026),
  ])
  const partners = requireData(partnersResult, 'partners') as PartnerRow[]
  const grants = requireData(grantsResult, 'partner_grants') as GrantRow[]
  const metrics = requireData(metricsResult, 'partner_metrics') as MetricRow[]
  const schedules = requireData(schedulesResult, 'partner_schedules') as ScheduleRow[]
  const cash = requireData(cashResult, 'petty_cash_monthly') as CashRow[]
  const grantByPartner = new Map(grants.map(row => [row.partner_id, row]))
  const metricByPartner = new Map<string, Map<string, number>>()
  for (const row of metrics) {
    if (!metricByPartner.has(row.partner_id)) metricByPartner.set(row.partner_id, new Map())
    metricByPartner.get(row.partner_id)!.set(row.metric, Number(row.value))
  }
  const dataPartners = partners.map(partner => {
    const grant = grantByPartner.get(partner.id)
    const values = metricByPartner.get(partner.id) ?? new Map<string, number>()
    const schedule = Array(12).fill(0) as number[]
    const scheduleUnverified = Array(12).fill(false) as boolean[]
    for (const row of schedules.filter(item => item.partner_id === partner.id)) {
      if (row.month >= 1 && row.month <= 12) {
        if (row.amount !== null) schedule[row.month - 1] = Number(row.amount)
        if (row.verification_status === 'unverified_external_formula') scheduleUnverified[row.month - 1] = true
      }
    }
    return {
      name: partner.name,
      budget: Number(grant?.entered_total ?? 0),
      finalGrant: Number(grant?.entered_effective_grant ?? 0),
      schedule, scheduleUnverified, received: Array(12).fill(0) as number[],
      cs: values.get('CS') ?? 0,
      ecc: values.get('ECC') ?? 0,
      ea: (values.get('EA') ?? 0) + (values.get('EA 12K') ?? 0) + (values.get('EA 15K') ?? 0),
      socialWorkers: values.get('Social Worker') ?? 0,
      psw: values.get('PSW') ?? 0,
      apeTarget: values.get('APE') ?? 0,
    }
  })
  const cashByCategory = new Map<string, number[]>()
  for (const row of cash) {
    if (!cashByCategory.has(row.category)) cashByCategory.set(row.category, Array(12).fill(0))
    if (row.month >= 1 && row.month <= 12) cashByCategory.get(row.category)![row.month - 1] = Number(row.amount)
  }
  return {
    year: 2026, source: 'Supabase', snapshotDate: new Date().toISOString(), months,
    partners: dataPartners,
    expenses: [...cashByCategory].map(([category, monthly]) => ({ category, monthly })),
    workbookTotals: {
      budget: dataPartners.reduce((sum, partner) => sum + partner.budget, 0),
      finalGrant: dataPartners.reduce((sum, partner) => sum + partner.finalGrant, 0),
    },
  }
}
