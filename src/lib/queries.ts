export const DRUGS_QUERY = `
  query Drugs {
    drugs {
      atcCode
      name
      narcoticClass
    }
  }
`

export const SEARCH_DRUGS_QUERY = `
  query SearchDrugs($query: String!) {
    searchDrugs(query: $query) {
      atcCode
      name
      narcoticClass
    }
  }
`

export const REGIONS_QUERY = `
  query Regions {
    regions {
      id
      regionName
    }
  }
`

export const MY_MEDICATIONS_QUERY = `
  query Me {
    me {
      medications {
        notes
        addedAt
        drugData {
          atcCode
          name
          narcoticClass
        }
      }
    }
  }
`

export const DRUG_INSIGHTS_QUERY = `
  query DrugInsights($atcCode: String!, $year: Int, $region: Int, $gender: Int, $ageGroup: Int) {
    drugInsights(atcCode: $atcCode, year: $year, region: $region, gender: $gender, ageGroup: $ageGroup) {
      trend {
        year
        totalPrescriptions
        totalPatients
        per1000
      }
      regionalPopularity {
        regionId
        regionName
        per1000
      }
      genderSplit {
        year
        gender
        per1000
      }
      ageSplit {
        year
        ageGroupId
        ageGroupName
        per1000
      }
      demographicGrid {
        gender
        ageGroupId
        ageGroupName
        per1000
      }
    }
  }
`

export const DRUG_INFO_QUERY = `
  query DrugInfo($atcCode: String!) {
    drugInfo(atcCode: $atcCode) {
      atcCode
      indication
      howToUse
      otherUses
      precautions
      sideEffects
      otherInfo
      sourceUrl
      cachedAt
    }
  }
`

// Lightweight query — only fetches demographicGrid, so it can accept a year
// filter without affecting the full trend series.
export const DEMOGRAPHIC_GRID_QUERY = `
  query DemographicGrid($atcCode: String!, $year: Int, $region: Int) {
    drugInsights(atcCode: $atcCode, year: $year, region: $region) {
      demographicGrid {
        gender
        ageGroupId
        ageGroupName
        per1000
      }
    }
  }
`

export const AGE_SPLIT_QUERY = `
  query AgeSplit($atcCode: String!, $region: Int, $gender: Int) {
    drugInsights(atcCode: $atcCode, region: $region, gender: $gender) {
      ageSplit {
        year
        ageGroupId
        ageGroupName
        per1000
      }
    }
  }
`

export const ADD_MEDICATION_MUTATION = `
  mutation AddMedication($atc: String!, $notes: String) {
    addMedication(atc: $atc, notes: $notes) {
      notes
      addedAt
      drugData {
        atcCode
        name
        narcoticClass
      }
    }
  }
`

export const UPDATE_MEDICATION_MUTATION = `
  mutation UpdateMedication($atc: String!, $notes: String) {
    updateMedication(atc: $atc, notes: $notes) {
      notes
      addedAt
      drugData {
        atcCode
        name
        narcoticClass
      }
    }
  }
`

export const REMOVE_MEDICATION_MUTATION = `
  mutation RemoveMedication($atc: String!) {
    removeMedication(atc: $atc) {
      atc
    }
  }
`
