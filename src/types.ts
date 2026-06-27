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
  genderId: number
  gender: string
  per1000: number
}

export interface DemographicCell {
  genderId: number
  gender: string // "Män" || "Kvinnor"
  ageGroupId: number
  ageGroupName: string
  per1000: number
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

export interface AgeBand {
  name: string
  id: number
}

export const AGE_BANDS: AgeBand[] = [
  { id: 1, name: '0-4' },
  { id: 2, name: '5-9' },
  { id: 3, name: '10-14' },
  { id: 4, name: '15-19' },
  { id: 5, name: '20-24' },
  { id: 6, name: '25-29' },
  { id: 7, name: '30-34' },
  { id: 8, name: '35-39' },
  { id: 9, name: '40-44' },
  { id: 10, name: '45-49' },
  { id: 11, name: '50-54' },
  { id: 12, name: '55-59' },
  { id: 13, name: '60-64' },
  { id: 14, name: '65-69' },
  { id: 15, name: '70-74' },
  { id: 16, name: '75-79' },
  { id: 17, name: '80-84' },
  { id: 18, name: '85+' }
]

export interface UserMedication {
  addedAt: string
  drugData: Drug
}
