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

export interface UserMedication {
  notes: string | null
  addedAt: string
  drugData: Drug
}
