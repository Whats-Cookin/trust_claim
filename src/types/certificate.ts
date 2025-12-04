export interface VideoMedia {
  url: string
  metadata?: {
    type?: string
    duration?: number
    thumbnail?: string
    transcript?: string
  }
}

export interface CertificateProps {
  issuer_name?: string
  subject?: string
  statement?: string
  effectiveDate?: string
  sourceURI?: string
  validations?: Validation[]
  claimId?: string
  image?: string
  videos?: VideoMedia[]
  name?: string
  claim?: {
    claimData: any
    type?: string
    name?: string
    aspect?: string
    claim?: string
  }
  subject_name?: string
  subjectType?: string
}

export interface Validation {
  subject_name: string
  issuer_name: string
  statement: string
  date?: string
  confidence?: number
  howKnown?: string
  sourceURI?: string
  image?: string
  mediaUrl?: string
  subject?: string
  effectiveDate?: string
}

export interface SharePopoverProps {
  anchorEl: HTMLButtonElement | null
  onClose: () => void
  onCopyLink: () => void
  onLinkedInShare: () => void
}

export interface ValidationDialogProps {
  open: boolean
  onClose: () => void
  validations?: Validation[]
  onValidationClick: (validation: Validation) => void
}

export interface ValidationDetailsDialogProps {
  open: boolean
  onClose: () => void
  validation: Validation | null
}
