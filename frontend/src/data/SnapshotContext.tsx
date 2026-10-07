import { createContext, useContext, type ReactNode } from 'react'

export type PartnerData = {
  name: string
  budget: number
  finalGrant: number
  schedule: number[]
  scheduleUnverified?: boolean[]
  received: number[]
  cs: number
  ecc: number
  ea: number
  socialWorkers: number
  psw: number
  apeTarget: number
}
export type DashboardData = {
  year: number
  source: string
  snapshotDate: string
  months: string[]
  partners: PartnerData[]
  expenses: { category: string; monthly: number[] }[]
  workbookTotals: { budget: number; finalGrant: number }
}
export const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const emptyData: DashboardData = {
  year: 2026, source: 'Supabase', snapshotDate: '',
  months, partners: [], expenses: [], workbookTotals: { budget: 0, finalGrant: 0 },
}
const DataContext = createContext<DashboardData>(emptyData)
const LiveContext = createContext(false)
export function DataProvider({ data, children, live = true }: { data: DashboardData; children: ReactNode; live?: boolean }) {
  return <DataContext.Provider value={data}><LiveContext.Provider value={live}>{children}</LiveContext.Provider></DataContext.Provider>
}
export const useDashboardData = () => useContext(DataContext)
export const useLiveMode = () => useContext(LiveContext)
