export const MY_MEDICATIONS_QUERY = `
  query MyMedications {
    myMedications {
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

export const MY_MEDICATIONS_WITH_INSIGHTS_QUERY = `
  query MyMedicationsWithInsights {
    myMedications {
      drugData {
        atcCode
      }
      insights {
        regionalPopularity {
          regionId
          regionName
          per1000
        }
      }
    }
  }
`

const MEDICATION_FIELDS_WITH_INSIGHTS = `
  notes
  addedAt
  drugData {
    atcCode
    name
    narcoticClass
  }
  insights {
    regionalPopularity {
      regionId
      regionName
      per1000
    }
  }
`

export const ADD_MEDICATION_MUTATION = `
  mutation AddMedication($atc: String!, $notes: String) {
    addMedication(atc: $atc, notes: $notes) {
      ${MEDICATION_FIELDS_WITH_INSIGHTS}
    }
  }
`

export const UPDATE_MEDICATION_MUTATION = `
  mutation UpdateMedication($atc: String!, $notes: String) {
    updateMedication(atc: $atc, notes: $notes) {
      ${MEDICATION_FIELDS_WITH_INSIGHTS}
    }
  }
`

export const REMOVE_MEDICATION_MUTATION = `
  mutation RemoveMedication($atc: String!) {
    removeMedication(atc: $atc)
  }
`
