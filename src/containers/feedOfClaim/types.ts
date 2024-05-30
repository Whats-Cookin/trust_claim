import { IconButtonProps } from '@mui/material'

export interface IHomeProps {
  toggleSnackbar: (toggle: boolean) => void
  setSnackbarMessage: (message: string) => void
  setLoading: (isLoading: boolean) => void
}
export interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}
export type Claim = {
  claim_id: number
  id: number
  nodeUri: string
  name: string
  entType: string
  descrip: string
  image: null
  thumbnail: string
  edgesFrom: {
    id: number
    claimId: number
    startNodeId: number
    endNodeId: number
    label: string
    thumbnail: null
    claim: {
      id: number
      subject: string
      claim: string
      object: string
      amt: null
      aspect: string
      author: null
      claimAddress: null
      confidence: number
      createdAt: string
      curator: null
      dateObserved: null
      digestMultibase: null
      effectiveDate: null
      howKnown: string
      howMeasured: null
      intendedAudience: null
      issuerId: string
      issuerIdType: string
      lastUpdatedAt: string
      proof: null
      respondAt: null
      score: number
      sourceURI: string
      stars: null
      statement: string
      unit: null
    }
    startNode: {
      id: number
      nodeUri: string
      name: string
      entType: string
      descrip: string
      image: null
      thumbnail: string
    }
    endNode: {
      id: number
      nodeUri: string
      name: string
      entType: string
      descrip: string
      image: null
      thumbnail: string
    }
  }[]
  edgesTo: never[]
}
