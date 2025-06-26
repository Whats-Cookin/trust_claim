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

      // Ensure numeric fields are properly typed
      const transformedDto: any = { ...dto }

      // Convert stars to number if it exists
      if (transformedDto.stars !== undefined && transformedDto.stars !== null) {
        const starsNum = Number(transformedDto.stars)
        transformedDto.stars = isNaN(starsNum) ? null : starsNum
      }

      // Convert amt to number if it exists
      if (transformedDto.amt !== undefined && transformedDto.amt !== null) {
        const amtNum = Number(transformedDto.amt)
        transformedDto.amt = isNaN(amtNum) ? null : amtNum
      }

      // Convert confidence to number if it exists
      if (transformedDto.confidence !== undefined && transformedDto.confidence !== null) {
        const confidenceNum = Number(transformedDto.confidence)
        transformedDto.confidence = isNaN(confidenceNum) ? null : confidenceNum
      }

      // Set score to stars value for backwards compatibility
      if (transformedDto.stars !== undefined && transformedDto.stars !== null && !isNaN(transformedDto.stars)) {
        transformedDto.score = transformedDto.stars
      }

      // Handle legacy field mappings
      if ((dto as any).rating !== undefined) {
        const ratingNum = Number((dto as any).rating)
        transformedDto.score = isNaN(ratingNum) ? null : ratingNum
        delete (transformedDto as any).rating
      }
      if ((dto as any).amount !== undefined) {
        const amountNum = Number((dto as any).amount)
        transformedDto.amt = isNaN(amountNum) ? null : amountNum
        delete (transformedDto as any).amount
      }

      // Validate required fields before sending
      if (!transformedDto.subject || !transformedDto.claim) {
        throw new Error('Subject and claim are required')
      }

      console.log('🚀 Final transformed payload:', transformedDto)
      console.log('🚀 Sending JSON payload to /api/claims:', JSON.stringify(transformedDto, null, 2))

      // If no images, send as JSON directly, otherwise try base64 encoding
      let res
      if (images.length === 0) {
        console.log('📤 Sending as JSON (no images)')
        res = await api.createClaim(transformedDto)
      } else {
        console.log('📤 Converting images to base64 for JSON payload')
        
        try {
          // Convert images to base64 and include in JSON payload
          const imagesAsBase64 = await Promise.all(
            images.map(async (file, index) => {
              return new Promise<any>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => {
                  const base64 = reader.result as string
                  const imageData = {
                    data: base64,
                    filename: file.name,
                    type: file.type,
                    size: file.size,
                    metadata: transformedDto.images?.[index] || { metadata: { caption: null, description: null }, effectiveDate: new Date().toISOString() }
                  }
                  console.log(`📸 Converted image ${index}: ${file.name} (${file.size} bytes) to base64`)
                  resolve(imageData)
                }
                reader.onerror = reject
                reader.readAsDataURL(file)
              })
            })
          )
          
          // Create payload with base64 images
          const payloadWithImages = {
            ...transformedDto,
            images: imagesAsBase64
          }
          
          console.log('📤 Sending JSON with base64 images:', imagesAsBase64.length, 'images')
          res = await api.createClaim(payloadWithImages)
          
        } catch (imageConversionError: any) {
          console.error('❌ Image conversion failed:', imageConversionError)
          console.log('🔄 Falling back to JSON without images')
          
          // Fallback: Create claim without images
          const claimWithoutImages = { ...transformedDto }
          delete claimWithoutImages.images
          
          res = await api.createClaim(claimWithoutImages)
          
          // Notify user about the fallback
          console.warn('⚠️ Images could not be processed, but claim was created successfully')
          message = 'Claim created successfully, but images could not be processed. Please try adding images later.'
        }
      }

      if (res.status === 200 || res.status === 201) {
        message = 'Claim submitted successfully!'
        isSuccess = true
      }
    } catch (err: any) {
      console.error('Full error:', err)
      console.error('Error response:', err.response)

      // Check if it's our custom error message from the interceptor
      if (err.message === 'Please login again') {
        message = 'Please login again'
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        message = 'Please login again'
      } else {
        message = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong'
      }

      console.error('Error details:', err.response?.data)
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
      // Validate that we have a valid file
      if (image.file && image.file instanceof File) {
        images.push(image.file)
        console.log('📎 Adding image file:', image.file.name, 'size:', image.file.size, 'type:', image.file.type)
      } else {
        console.warn('⚠️ Invalid image file found:', image)
      }
      
      return {
        metadata: image.metadata,
        effectiveDate: image.effectiveDate
      } as Omit<MediaI, 'file' | 'url'>
    })
  }

  // Remove images array if empty to avoid sending unnecessary data
  if (dto.images.length === 0) {
    delete (dto as any).images
  }

  console.log('📦 Prepared payload - DTO keys:', Object.keys(dto), 'Image files:', images.length)
  return { images, dto }
}

function generateFormData(dto: unknown, images: File[]): FormData {
  const form = new FormData()
  
  console.log('🔍 Generating FormData for dto:', dto)
  const dataObj = dto as Record<string, any>
  
  // Try the original dto blob approach - this is what backend might expect
  const dtoBlob = new Blob([JSON.stringify(dataObj)], { type: 'application/json' })
  form.append('dto', dtoBlob)
  console.log('📋 FormData: dto blob =', JSON.stringify(dataObj, null, 2))
  
  // Append image files with proper names
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    form.append('images', img, img.name) // Include filename
    console.log(`📋 FormData: images[${i}] = ${img.name} (${img.size} bytes, ${img.type})`)
  }
  
  // Debug: Check if dto blob is correct
  console.log('🔍 DTO Blob size:', dtoBlob.size, 'bytes')
  console.log('🔍 DTO Blob type:', dtoBlob.type)
  
  // Debug: Log all FormData entries
  console.log('📋 All FormData entries:')
  const allEntries: string[] = []
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      const entry = `${key}: File(${value.name}, ${value.size} bytes)`
      allEntries.push(entry)
      console.log(`  ${entry}`)
    } else {
      // Handle Blob and string values
      const entry = `${key}: ${typeof value} - ${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}`
      allEntries.push(entry)
      console.log(`  ${entry}`)
    }
  }
  console.log(`📋 Total entries: ${allEntries.length}`)
  
  return form
}
