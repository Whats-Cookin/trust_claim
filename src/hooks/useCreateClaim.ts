import { useCallback } from 'react'
import * as api from '../api'
import { MediaI } from '../components/Form/imageUploading'
import { getCurrentAccount, signAndPrepareClaim } from '../utils/web3Auth'

interface ClaimPayload {
  subject: string
  claim: string
  images: MediaI[]
  [key: string]: any // Allow additional fields
}

interface CreateClaimResponse {
  message: string
  isSuccess: boolean
}

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: ClaimPayload): Promise<CreateClaimResponse> => {
    try {
      // Validate required fields early
      if (!payload.subject?.trim()) {
        return {
          message: 'Subject is required',
          isSuccess: false
        }
      }

      // Check for actual claim content - either in statement or claim field
      const claimText = (payload as any).statement || payload.claim
      if (!claimText?.trim()) {
        return {
          message: 'Claim description is required',
          isSuccess: false
        }
      }

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Initial payload:', payload)
        console.log('Authentication state:', {
          accessToken: !!localStorage.getItem('accessToken'),
          refreshToken: !!localStorage.getItem('refreshToken'),
          did: localStorage.getItem('did'),
          ethAddress: localStorage.getItem('ethAddress')
        })
      }

      // Check if user has wallet connected for client-side signing
      const walletAddress = await getCurrentAccount()
      let finalPayload = payload

      if (walletAddress) {
        try {
          // Sign the claim with MetaMask
          finalPayload = await signAndPrepareClaim(payload)
          console.log('Claim signed with wallet:', walletAddress)
        } catch (signError) {
          console.warn('Failed to sign claim with wallet:', signError)
          // Continue without signature - backend will sign
        }
      }

      const { images, dto } = preparePayload(finalPayload)

      // Transform field names for new API
      const transformedDto: any = {
        ...dto,
        // Map statement to claim for backend compatibility
        claim: (dto as any).statement || dto.claim,
        // Map rating fields
        score: (dto as any).rating || (dto as any).stars || undefined,
        amt: (dto as any).amount || (dto as any).amt || undefined,
        // Keep the claim type in a different field
        claimType:
          dto.claim === 'rated' || dto.claim === 'impact' || dto.claim === 'report' || dto.claim === 'related_to'
            ? dto.claim
            : undefined
      }

      // Clean up transformed object
      const fieldsToRemove = ['rating', 'stars', 'amount', 'statement']
      fieldsToRemove.forEach(field => delete transformedDto[field])

      // Remove null/undefined values
      Object.keys(transformedDto).forEach(key => {
        if (transformedDto[key] === null || transformedDto[key] === undefined) {
          delete transformedDto[key]
        }
      })

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending payload to backend:', transformedDto)
      }

      // Send request - use FormData for images, JSON otherwise
      const response =
        images.length > 0
          ? await api.createClaim(generateFormData(transformedDto, images))
          : await api.createClaim(transformedDto)

      if (process.env.NODE_ENV === 'development') {
        console.log('Response:', { status: response.status, data: response.data })
      }

      // Handle successful responses (200 or 201)
      if (response.status === 200 || response.status === 201) {
        return {
          message: 'Claim submitted successfully!',
          isSuccess: true
        }
      }

      // Handle unexpected success status codes
      console.warn('Unexpected status code:', response.status)
      return {
        message: `Claim created with status ${response.status}`,
        isSuccess: true
      }
    } catch (err: any) {
      // Log full error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Create claim error:', {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        })
      }

      // Extract meaningful error message
      let errorMessage = 'Something went wrong'

      if (err.response?.data?.errors) {
        // Handle validation errors object
        const errors = err.response.data.errors
        errorMessage = Object.entries(errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }

      // Add status-specific context
      if (err.response?.status === 400) {
        errorMessage = `Invalid request: ${errorMessage}`
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.'
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to create claims. Please contact an administrator.'
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.'
      }

      return {
        message: errorMessage,
        isSuccess: false
      }
    }
  }, [])

  return { createClaim }
}

function preparePayload(payload: ClaimPayload): {
  dto: Omit<ClaimPayload, 'images'> & { images: Omit<MediaI, 'file' | 'url'>[] }
  images: File[]
} {
  const images: File[] = []
  const did = localStorage.getItem('did')

  const dto = {
    ...payload,
    ...(did && { issuerId: did }),
    images:
      payload.images?.map(image => {
        images.push(image.file)
        return {
          metadata: image.metadata,
          effectiveDate: image.effectiveDate
        } as Omit<MediaI, 'file' | 'url'>
      }) || []
  }

  return { images, dto }
}

function generateFormData(dto: unknown, images: File[]): FormData {
  const form = new FormData()
  form.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  images.forEach(img => form.append('images', img))
  return form
}
