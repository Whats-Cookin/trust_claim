export interface CertificateProps {
  issuer_name?: string
  subject?: string
  statement?: string
  effectiveDate?: string
  sourceURI?: string
  validations?: Validation[]
  claimId?: string
  image?: string
  name?: string
  claim?: {
    claimData: any
    type?: string
    name?: string
  }
  subject_name?: string
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
