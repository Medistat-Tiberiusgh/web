export const DRUGS_QUERY = `
  query Drugs {
    drugs {
      atcCode
      name
      narcoticClass
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
  query DrugInsights($atcCode: String!, $year: Int, $region: Int) {
    drugInsights(atcCode: $atcCode, year: $year, region: $region) {
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
    removeMedication(atc: $atc)
  }
`
