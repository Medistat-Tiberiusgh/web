export interface RegionalStat {
  regionId: number
  regionName: string
  per1000: number
}

export interface TrendPoint {
  year: number
  totalPrescriptions: number
  totalPatients: number
  per1000: number
}

export interface GenderSplitPoint {
  year: number
  gender: string
  per1000: number
}

export interface DrugInsights {
  regionalPopularity: RegionalStat[]
  trend: TrendPoint[]
  genderSplit: GenderSplitPoint[]
  ageSplit: AgeSplitPoint[]
}

export interface AgeSplitPoint {
  year: number
  ageGroupId: number
  ageGroupName: string
  per1000: number
}

export interface Drug {
  atcCode: string
  name: string
  narcoticClass: string | null
}

export interface Region {
  id: number
  regionName: string
}

export interface UserMedication {
  notes: string | null
  addedAt: string
  drugData: Drug
}
