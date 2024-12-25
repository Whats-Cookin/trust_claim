import { useCallback } from 'react'
import axios from '../axiosInstance'
import { ImageI } from '../components/Form/imageUploading'
import { ceramic, composeClient } from '../composedb'
import { PublishClaim } from '../composedb/compose'
import { canSignClaims, initializeDIDAuth } from '../utils/authUtils'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any) => {
    let message = 'Something went wrong!'
    let isSuccess = false
    try {
      // Check if we can sign claims with DID
      if (canSignClaims()) {
        // Ensure ceramic is authenticated
        if (!ceramic.did) {
          await initializeDIDAuth(ceramic, composeClient)
        }

        try {
          const claim = await PublishClaim(payload)
          if (claim) {
            console.log('Published to ceramic!', claim)
            try {
              payload['claimAddress'] = claim['data']['createLinkedClaim']['document']['id']
            } catch (err) {
              console.warn('Could not extract claim address:', err)
            }
          }
        } catch (err) {
          console.error('Error publishing claim to ceramic:', err)
        }
      }

      const { images, dto } = preparePayload(payload)
      console.log('Sending payload:', dto)
      const res = await axios.post('/api/claim/v2', generateFormData(dto, images))

      if (res.status === 201) {
        message = 'Claim submitted successfully!'
        isSuccess = true
      }
    } catch (err: any) {
      if (err.response) {
        message = err.response.data.message
      }
    }
    return { message, isSuccess }
  }, [])

  return { createClaim }
}

function preparePayload<T extends { images: ImageI[] }>(
  payload: T
): { dto: Omit<T, 'images'> & { images: Omit<ImageI, 'file' | 'url'>[] }; images: File[] } {
  const images: File[] = []
  const dto = {
    ...payload,
    images: payload.images.map(image => {
      images.push(image.file)
      return {
        metadata: image.metadata,
        effectiveDate: image.effectiveDate
      } as Omit<ImageI, 'file' | 'url'>
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
