import { useCallback } from 'react'
import axios from '../axiosInstance'
import { ImageI } from '../components/Form/imageUploading'
import { authenticateCeramic, ceramic, composeClient } from '../composedb'
import { PublishClaim } from '../composedb/compose'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any) => {
    let message = 'Something went wrong!'
    let isSuccess = false
    try {
      // TODO better way of checking the login method

      // check if the user is authenticated with metamask and has did
      const did = localStorage.getItem('did')
      const ethAddress = localStorage.getItem('ethAddress')

      // quick fix for "Ceramic instance is not authenticated" error
      if (!ceramic.did) {
        try {
          const session = await authenticateCeramic(ceramic, composeClient)
          console.log(`Session: ${session}`)
        } catch (error) {
          console.log(`Error authenticating ceramic instance: Error message: ${error}`)
        }
      }

      let claim
      if (did && ethAddress) {
        console.log('User has did ' + did + ' and ethaddress ' + ethAddress + ' so publishing to ceramic')
        try {
          claim = await PublishClaim(payload)
        } catch (err) {
          console.log('Error trying to publish claim to ceramic: ' + err)
        }
      }

      // if we got a claim, include the address
      console.log('publish claim returned: ' + JSON.stringify(claim))
      if (claim) {
        console.log('Published to ceramic! ' + JSON.stringify(claim))
        try {
          payload['claimAddress'] = claim['data']['createLinkedClaim']['document']['id']
          console.log('added claim address')
        } catch (err) {
          console.log('could not extract claim address')
        }
      }
      console.log('Saving to database with payload: ' + JSON.stringify(payload))

      const { images, dto } = preparePayload(payload)
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
  console.log({ imagePayload: payload.images })
  const images: File[] = []
  const dto = {
    ...payload,
    images: payload.images.map(image => {
      images.push(image.file)
      return { metadata: image.metadata, effectiveDate: image.effectiveDate, signature: '==' } as Omit<
        ImageI,
        'file' | 'url'
      >
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
