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

// Single query that drives the entire dashboard. The `reg` alias is only
// requested when a region filter is active (see $hasRegion @include directive).
export const DASHBOARD_QUERY = `
  query Dashboard(
    $atcCode: String!
    $region: Int
    $gender: Int
    $ageGroup: Int
    $year: Int
    $hasRegion: Boolean!
  ) {
    nat: drugInsights(atcCode: $atcCode) {
      trend(gender: $gender, ageGroup: $ageGroup) {
        year
        totalPrescriptions
        totalPatients
        per1000
      }
      genderSplit(ageGroup: $ageGroup) {
        year
        genderId
        gender
        per1000
      }
      regionalPopularity(gender: $gender, ageGroup: $ageGroup) {
        regionId
        regionName
        per1000
      }
      ageSplit(gender: $gender) {
        year
        ageGroupId
        ageGroupName
        per1000
      }
      demographicGrid(year: $year) {
        genderId
        gender
        ageGroupId
        ageGroupName
        per1000
      }
    }
    reg: drugInsights(atcCode: $atcCode) @include(if: $hasRegion) {
      trend(region: $region, gender: $gender, ageGroup: $ageGroup) {
        year
        totalPrescriptions
        totalPatients
        per1000
      }
      genderSplit(region: $region, ageGroup: $ageGroup) {
        year
        genderId
        gender
        per1000
      }
      ageSplit(region: $region, gender: $gender) {
        year
        ageGroupId
        ageGroupName
        per1000
      }
      demographicGrid(year: $year, region: $region) {
        genderId
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

export const REMOVE_MEDICATION_MUTATION = `
  mutation RemoveMedication($atc: String!) {
    removeMedication(atc: $atc) {
      addedAt
      drugData {
        atcCode
      }
    }
  }
`
