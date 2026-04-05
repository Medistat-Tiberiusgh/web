export interface RegionalStat {
  regionId: number
  regionName: string
  per1000: number
}

export interface UserMedication {
  notes: string | null
  addedAt: string
  drugData: {
    atcCode: string
    name: string
    narcoticClass: string | null
  }
  insights?: {
    regionalPopularity: RegionalStat[]
  }
}
