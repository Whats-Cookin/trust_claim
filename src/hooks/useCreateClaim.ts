import { useCallback } from 'react'
import * as api from '../api'
import { MediaI } from '../components/Form/imageUploading'
import { getCurrentAccount, signAndPrepareClaim } from '../utils/web3Auth'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any) => {
    let message = 'Something went wrong!'
    let isSuccess = false
    try {
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
      console.log('Sending payload:', dto, images)
      // Transform field names for new API
      const transformedDto = {
        ...dto,
        score: (dto as any).rating,
        amt: (dto as any).amount
      }
      delete (transformedDto as any).rating
      delete (transformedDto as any).amount
      
      const res = await api.createClaim(generateFormData(transformedDto, images))

      if (res.status === 201) {
        message = 'Claim submitted successfully!'
        isSuccess = true
      }
    } catch (err: any) {
      message = err.response?.data.message || 'Something went wrong'
      console.error(err.response?.data)
    }
    return { message, isSuccess }
  }, [])

  return { createClaim }
}

function preparePayload<T extends { images: MediaI[] }>(
  payload: T
): { dto: Omit<T, 'images'> & { images: Omit<MediaI, 'file' | 'url'>[] }; images: File[] } {
  const images: File[] = []

  const did = localStorage.getItem('did')

  const dto = {
    ...payload,
    ...(did && { issuerId: did }),
    images: payload.images.map(image => {
      images.push(image.file)
      return {
        metadata: image.metadata,
        effectiveDate: image.effectiveDate
      } as Omit<MediaI, 'file' | 'url'>
    })
  }

  return { images, dto }
}

function generateFormData(dto: unknown, images: File[]): FormData {
  const form = new FormData()
  form.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  for (const img of images) {
    form.append('images', img)
  }
  return form
}
