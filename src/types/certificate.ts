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

export interface Claim {
  type?: string
  claim?: {
    name?: string
  }
}

export interface CertificateProps {
  subject_name: string
  issuer_name: string
  subject: string
  statement?: string
  effectiveDate?: string
  sourceURI?: string
  validations: Validation[]
  claimId?: string
  image?: string
  name?: string
  claim?: Claim
}

export interface ValidationDialogProps {
  open: boolean
  onClose: () => void
  validations: Validation[]
  onValidationClick: (validation: Validation) => void
}

export interface ValidationDetailsDialogProps {
  open: boolean
  onClose: () => void
  validation: Validation | null
}

export interface SharePopoverProps {
  anchorEl: HTMLButtonElement | null
  onClose: () => void
  onCopyLink: () => void
  onLinkedInShare: () => void
} 