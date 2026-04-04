export interface Region {
  regionName: string
  regionId: number
  per1000: number
}

export interface Medication {
  notes: string | null
  drugData: {
    name: string
    atcCode: string
    narcoticClass: string | null
  }
  insights: {
    regionalPopularity: Region[]
  }
}
