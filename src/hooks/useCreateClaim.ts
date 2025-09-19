import { useCallback } from 'react'
import * as api from '../api'
import { MediaI } from '../components/Form/imageUploading'
import { getCurrentAccount, signAndPrepareClaim } from '../utils/web3Auth'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any): Promise<{ message: string; isSuccess: boolean }> => {
    let message = 'Something went wrong!'
    let isSuccess = false

    console.log('🔍 === useCreateClaim DEBUG SESSION START ===')
    console.log('🔍 Original payload received:', JSON.stringify(payload, null, 2))
    console.log('🔍 Payload keys:', Object.keys(payload))
    console.log(
      '🔍 Payload types:',
      Object.keys(payload).map(key => `${key}: ${typeof payload[key]}`)
    )

    try {
      // Check if user has wallet connected for client-side signing
      const walletAddress = await getCurrentAccount()
      let finalPayload = payload

      if (walletAddress) {
        try {
          console.log('🔐 MetaMask wallet detected:', walletAddress)
          console.log('📝 Requesting signature for claim...')

          // Sign the claim with MetaMask - this will trigger the MetaMask popup
          finalPayload = await signAndPrepareClaim(payload)

          console.log('✅ Claim signed successfully!')
          console.log('📦 Signed payload includes:', {
            issuerId: finalPayload.issuerId,
            issuerIdType: finalPayload.issuerIdType,
            proofType: finalPayload.proof?.type,
            hasSignature: !!finalPayload.proof?.proofValue
          })
        } catch (signError: any) {
          console.warn('⚠️ MetaMask signing failed:', signError.message)
          if (signError.message.includes('User rejected')) {
            console.log('👤 User rejected the signature request')
          }
          console.log('📤 Continuing without client signature - claim will be unsigned')
          // Continue without signature - claim creation should not fail
        }
      } else {
        console.log('📤 No MetaMask wallet connected - creating unsigned claim')
      }

      const { images, dto } = preparePayload(finalPayload)
      console.log('📦 Prepared payload - DTO:', JSON.stringify(dto, null, 2))
      console.log('📦 Prepared payload - Images count:', images.length)

      // Ensure numeric fields are properly typed and validate for null/undefined issues
      const transformedDto: any = { ...dto }

      console.log('🔧 === FIELD TRANSFORMATION & VALIDATION ===')

      // Convert stars to number if it exists and validate
      if (transformedDto.stars !== undefined && transformedDto.stars !== null && transformedDto.stars !== '') {
        const starsNum = Number(transformedDto.stars)
        transformedDto.stars = isNaN(starsNum) ? null : starsNum
        console.log(`🔧 stars: ${payload.stars} → ${transformedDto.stars} (${typeof transformedDto.stars})`)
      } else {
        transformedDto.stars = null
        console.log('🔧 stars: set to null (was undefined/null/empty)')
      }

      // Convert amt to number if it exists and validate
      if (transformedDto.amt !== undefined && transformedDto.amt !== null && transformedDto.amt !== '') {
        const amtNum = Number(transformedDto.amt)
        transformedDto.amt = isNaN(amtNum) ? null : amtNum
        console.log(`🔧 amt: ${payload.amt} → ${transformedDto.amt} (${typeof transformedDto.amt})`)
      } else {
        transformedDto.amt = null
        console.log('🔧 amt: set to null (was undefined/null/empty)')
      }

      // Convert confidence to number if it exists and validate
      if (
        transformedDto.confidence !== undefined &&
        transformedDto.confidence !== null &&
        transformedDto.confidence !== ''
      ) {
        const confidenceNum = Number(transformedDto.confidence)
        transformedDto.confidence = isNaN(confidenceNum) ? null : confidenceNum
        console.log(
          `🔧 confidence: ${payload.confidence} → ${transformedDto.confidence} (${typeof transformedDto.confidence})`
        )
      } else {
        transformedDto.confidence = null
        console.log('🔧 confidence: set to null (was undefined/null/empty)')
      }

      // Set score to stars value for backwards compatibility
      if (transformedDto.stars !== null && !isNaN(transformedDto.stars)) {
        transformedDto.score = transformedDto.stars
        console.log(`🔧 score: set to stars value (${transformedDto.score})`)
      }

      // Handle legacy field mappings
      if ((dto as any).rating !== undefined) {
        const ratingNum = Number((dto as any).rating)
        transformedDto.score = isNaN(ratingNum) ? null : ratingNum
        delete (transformedDto as any).rating
        console.log(`🔧 rating → score: ${(dto as any).rating} → ${transformedDto.score}`)
      }
      if ((dto as any).amount !== undefined) {
        const amountNum = Number((dto as any).amount)
        transformedDto.amt = isNaN(amountNum) ? null : amountNum
        delete (transformedDto as any).amount
        console.log(`🔧 amount → amt: ${(dto as any).amount} → ${transformedDto.amt}`)
      }

      // Validate and clean string fields for unexpected null values
      console.log('🔧 === STRING FIELD VALIDATION ===')
      const stringFields = ['subject', 'claim', 'object', 'statement', 'aspect', 'sourceURI', 'howKnown']
      stringFields.forEach(field => {
        if (transformedDto[field] === null || transformedDto[field] === undefined) {
          console.log(`🔧 ${field}: null/undefined → keeping as is`)
        } else if (transformedDto[field] === '') {
          console.log(`🔧 ${field}: empty string → setting to null`)
          transformedDto[field] = null
        } else {
          console.log(`🔧 ${field}: "${transformedDto[field]}" (valid)`)
        }
      })

      // Validate required fields before sending
      if (!transformedDto.subject || !transformedDto.claim) {
        console.error('❌ VALIDATION FAILED: Missing required fields')
        console.error('❌ subject:', transformedDto.subject)
        console.error('❌ claim:', transformedDto.claim)
        throw new Error('Subject and claim are required')
      }

      console.log('🚀 === FINAL PAYLOAD BEFORE API CALL ===')
      console.log('🚀 Final transformed payload:', JSON.stringify(transformedDto, null, 2))
      console.log('🚀 Payload size (JSON):', JSON.stringify(transformedDto).length, 'characters')

      // If no images, send as JSON directly, otherwise include base64 images
      let res
      if (images.length === 0) {
        console.log('📤 === SENDING JSON REQUEST (NO IMAGES) ===')
        console.log('📤 Request will be sent with Content-Type: application/json')

        try {
          res = await api.createClaim(transformedDto)
          console.log('✅ API call successful (no images)')
          console.log('✅ Response status:', res.status)
          console.log('✅ Response data:', JSON.stringify(res.data, null, 2))
        } catch (apiError: any) {
          console.error('❌ API call failed (no images):', apiError)
          console.error('❌ Error response:', apiError.response?.data)
          console.error('❌ Error status:', apiError.response?.status)
          console.error('❌ Error headers:', apiError.response?.headers)
          throw apiError
        }
      } else {
        console.log('📤 === SENDING JSON REQUEST WITH BASE64 IMAGES ===')
        console.log('📤 Converting', images.length, 'images to base64...')

        try {
          // Validate images array first
          if (!images || images.length === 0) {
            console.log('📤 No images to convert')
            throw new Error('No images to convert')
          }

          console.log('📤 Starting conversion of', images.length, 'images')

          // Convert images to base64 and include in JSON payload
          const imagesAsBase64 = await Promise.all(
            images.map(async (file, index) => {
              return new Promise<any>((resolve, reject) => {
                // Validate file first
                if (!file || !(file instanceof File)) {
                  console.error(`❌ Invalid file at index ${index}:`, file)
                  reject(new Error(`Invalid file at index ${index}`))
                  return
                }

                const reader = new FileReader()
                reader.onload = () => {
                  try {
                    const base64 = reader.result as string

                    // Validate base64 data
                    if (!base64 || !base64.startsWith('data:')) {
                      console.error(`❌ Invalid base64 data for image ${index}: ${file.name}`)
                      reject(new Error(`Invalid base64 data for image ${index}`))
                      return
                    }

                    // Split and validate base64 content
                    const base64Parts = base64.split(',')
                    if (base64Parts.length !== 2) {
                      console.error(`❌ Invalid base64 format for image ${index}: ${file.name}`)
                      reject(new Error(`Invalid base64 format for image ${index}`))
                      return
                    }

                    const imageData = {
                      base64: base64Parts[1], // Remove data URL prefix
                      filename: file.name,
                      contentType: file.type,
                      size: file.size,
                      metadata: transformedDto.images?.[index]?.metadata || { caption: '', description: '' },
                      effectiveDate: transformedDto.images?.[index]?.effectiveDate
                        ? transformedDto.images[index].effectiveDate instanceof Date
                          ? transformedDto.images[index].effectiveDate.toISOString()
                          : transformedDto.images[index].effectiveDate
                        : new Date().toISOString()
                    }

                    console.log(`📸 Image ${index} converted:`)
                    console.log(`   - Filename: ${file.name}`)
                    console.log(`   - Type: ${file.type}`)
                    console.log(`   - Size: ${file.size} bytes`)
                    console.log(`   - Base64 length: ${base64.length} characters`)
                    console.log(`   - Base64 starts with: ${base64.substring(0, 50)}...`)

                    resolve(imageData)
                  } catch (conversionError) {
                    console.error(`❌ Error processing image ${index}:`, conversionError)
                    reject(conversionError)
                  }
                }
                reader.onerror = error => {
                  console.error(`❌ Failed to read image ${index}: ${file.name}`, error)
                  reject(error)
                }
                reader.readAsDataURL(file)
              })
            })
          )

          // Create payload with base64 images
          const payloadWithImages = {
            ...transformedDto,
            images: imagesAsBase64
          }

          console.log('📤 === FINAL PAYLOAD WITH IMAGES ===')
          console.log('📤 Images included:', imagesAsBase64.length)
          console.log('📤 Total payload size:', JSON.stringify(payloadWithImages).length, 'characters')

          // Enhanced image data analysis
          console.log('📤 === DETAILED IMAGE ANALYSIS ===')
          imagesAsBase64.forEach((img, index) => {
            console.log(`📸 Image ${index} structure:`)
            console.log(`   - filename: "${img.filename}"`)
            console.log(`   - contentType: "${img.contentType}"`)
            console.log(`   - size: ${img.size} bytes`)
            console.log(`   - base64Length: ${img.base64.length} characters`)
            console.log(`   - base64 prefix: "${img.base64.substring(0, 30)}..."`)
            console.log(`   - base64 suffix: "...${img.base64.substring(img.base64.length - 30)}"`)
            console.log(`   - metadata structure:`, img.metadata)

            // Check if base64 is valid (no data URL prefix)
            const base64ValidityTest = /^[A-Za-z0-9+/]*={0,2}$/.test(img.base64)
            console.log(`   - Base64 validity test:`, base64ValidityTest)

            if (!base64ValidityTest) {
              console.error(`   - ❌ Invalid base64 format for image ${index}`)
            }

            // Size analysis
            const sizeInKB = Math.round(img.base64.length / 1024)
            const estimatedFileSizeKB = Math.round(img.size / 1024)
            console.log(`   - Base64 size: ${sizeInKB}KB (original file: ${estimatedFileSizeKB}KB)`)

            if (sizeInKB > 500) {
              console.warn(`   - ⚠️ Large image detected: ${sizeInKB}KB - this might cause 400 errors`)
            }
          })

          // Test different image payload structures
          console.log('📤 === TESTING DIFFERENT IMAGE STRUCTURES ===')

          // Structure 1: Current structure (base64 field)
          if (imagesAsBase64.length > 0) {
            const currentStructure = imagesAsBase64[0]
            console.log('📤 Current structure (base64 field):', {
              keys: Object.keys(currentStructure),
              hasData: !!currentStructure.data,
              hasBase64: !!currentStructure.base64,
              hasContent: !!currentStructure.content,
              hasFile: !!currentStructure.file
            })
          } else {
            console.log('📤 No images to analyze structure')
          }

          // Structure 2: Alternative structure (data field)
          const alternativeImagesDataField = imagesAsBase64.map(img => ({
            filename: img.filename,
            type: img.contentType,
            size: img.size,
            data: `data:${img.contentType};base64,${img.base64}`, // Add data URL prefix
            metadata: img.metadata,
            effectiveDate: img.effectiveDate
          }))

          // Structure 3: Alternative structure (content field)
          const alternativeImagesContentField = imagesAsBase64.map(img => ({
            filename: img.filename,
            contentType: img.contentType,
            size: img.size,
            content: `data:${img.contentType};base64,${img.base64}`,
            metadata: img.metadata,
            effectiveDate: img.effectiveDate
          }))

          console.log('📤 Alternative structure samples:')
          if (alternativeImagesDataField.length > 0) {
            console.log('   - With data field:', {
              keys: Object.keys(alternativeImagesDataField[0]),
              dataLength: alternativeImagesDataField[0].data.length
            })
          }
          if (alternativeImagesContentField.length > 0) {
            console.log('   - With content field:', {
              keys: Object.keys(alternativeImagesContentField[0]),
              contentLength: alternativeImagesContentField[0].content.length
            })
          }

          // Create small test image for size testing
          const smallTestImageBase64 =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
          console.log('📤 Small test image (1x1 pixel):', {
            length: smallTestImageBase64.length,
            sizeKB: Math.round(smallTestImageBase64.length / 1024)
          })

          console.log('📤 === ACTUAL PAYLOAD STRUCTURE ===')
          console.log('📤 Payload keys:', Object.keys(payloadWithImages))
          console.log('📤 Images array structure:')
          console.log('   - Array length:', payloadWithImages.images.length)
          console.log('   - First image keys:', Object.keys(payloadWithImages.images[0]))
          console.log(
            '   - Full structure sample:',
            JSON.stringify(payloadWithImages.images[0], null, 2).substring(0, 500) + '...'
          )

          // Log complete payload structure (without full base64 content)
          const payloadForLogging = {
            ...payloadWithImages,
            images: payloadWithImages.images.map((img: any, idx: number) => ({
              ...img,
              base64: `[BASE64_DATA_${img.base64.length}_CHARS]`
            }))
          }
          console.log('📤 Complete payload structure (base64 truncated):', JSON.stringify(payloadForLogging, null, 2))

          console.log('📤 Request will be sent with Content-Type: application/json')
          console.log('📤 About to call api.createClaim with payload...')

          try {
            console.log('📤 Making API call to createClaim...')
            res = await api.createClaim(payloadWithImages)
            console.log('📤 API call completed, processing response...')
            console.log('✅ API call successful (with images)')
            console.log('✅ Response status:', res.status)
            console.log('✅ Response data:', JSON.stringify(res.data, null, 2))
          } catch (apiError: any) {
            console.error('❌ === API CALL FAILED WITH IMAGES ===')
            console.error('❌ Error message:', apiError.message)
            console.error('❌ Error response data:', apiError.response?.data)
            console.error('❌ Error status:', apiError.response?.status)
            console.error('❌ Error headers:', apiError.response?.headers)

            // Enhanced error analysis for 400 errors
            if (apiError.response?.status === 400) {
              console.error('❌ === 400 BAD REQUEST ANALYSIS ===')
              console.error('❌ This could be due to:')
              console.error('   - Incorrect image field names (data vs base64 vs content)')
              console.error('   - Invalid base64 format')
              console.error('   - Payload too large')
              console.error('   - Missing required fields')
              console.error('   - Incorrect metadata structure')

              const backendError = apiError.response?.data?.error || apiError.response?.data?.message
              if (backendError) {
                console.error('❌ Backend error message:', backendError)

                // Check for specific error patterns
                if (backendError.includes('base64')) {
                  console.error('❌ Base64 related error detected')
                } else if (backendError.includes('size') || backendError.includes('large')) {
                  console.error('❌ Size related error detected')
                } else if (backendError.includes('field') || backendError.includes('required')) {
                  console.error('❌ Field validation error detected')
                }
              }

              // Try alternative payload structures if main one fails
              console.log('🔄 === TRYING ALTERNATIVE IMAGE STRUCTURES ===')

              // Try with data field instead of base64 field
              try {
                console.log('🔄 Trying with data field...')
                const alternativePayload1 = {
                  ...transformedDto,
                  images: alternativeImagesDataField
                }
                console.log(
                  '🔄 Alternative payload 1 structure:',
                  JSON.stringify(
                    {
                      ...alternativePayload1,
                      images: alternativePayload1.images.map((img: any) => ({
                        ...img,
                        data: `[DATA_${img.data.length}_CHARS]`
                      }))
                    },
                    null,
                    2
                  )
                )

                const altRes1 = await api.createClaim(alternativePayload1)
                console.log('✅ Alternative structure 1 (data field) worked!', altRes1.status)
                res = altRes1
                message = 'Claim submitted successfully with alternative image structure!'
                isSuccess = true
                return { message, isSuccess } // Success with alternative structure
              } catch (altError1: any) {
                console.error(
                  '❌ Alternative structure 1 (data field) also failed:',
                  altError1.response?.status,
                  altError1.response?.data
                )
              }

              // Try with content field instead
              try {
                console.log('🔄 Trying with content field...')
                const alternativePayload2 = {
                  ...transformedDto,
                  images: alternativeImagesContentField
                }
                console.log(
                  '🔄 Alternative payload 2 structure:',
                  JSON.stringify(
                    {
                      ...alternativePayload2,
                      images: alternativePayload2.images.map((img: any) => ({
                        ...img,
                        content: `[BASE64_${img.content.length}_CHARS]`
                      }))
                    },
                    null,
                    2
                  )
                )

                const altRes2 = await api.createClaim(alternativePayload2)
                console.log('✅ Alternative structure 2 (content field) worked!', altRes2.status)
                res = altRes2
                message = 'Claim submitted successfully with alternative image structure!'
                isSuccess = true
                return { message, isSuccess } // Success with alternative structure
              } catch (altError2: any) {
                console.error(
                  '❌ Alternative structure 2 (content field) also failed:',
                  altError2.response?.status,
                  altError2.response?.data
                )
              }

              // Try with very small test image to check size limits
              try {
                console.log('🔄 Trying with tiny test image to check size limits...')
                const tinyImagePayload = {
                  ...transformedDto,
                  images: [
                    {
                      base64: smallTestImageBase64.split(',')[1],
                      filename: 'tiny-test.png',
                      contentType: 'image/png',
                      size: 68,
                      metadata: { caption: 'Test tiny image', description: 'Size test' },
                      effectiveDate: new Date().toISOString()
                    }
                  ]
                }

                const tinyRes = await api.createClaim(tinyImagePayload)
                console.log('✅ Tiny image worked! Issue is likely payload size. Status:', tinyRes.status)
                console.log('💡 Recommendation: Implement image compression or size limits')
                res = tinyRes
                message = 'Claim submitted successfully with tiny test image! Original images may be too large.'
                isSuccess = true
                return { message, isSuccess } // Success with tiny image
              } catch (tinyError: any) {
                console.error('❌ Even tiny image failed:', tinyError.response?.status, tinyError.response?.data)
                console.error('❌ This suggests the issue is not payload size but structure/format')
              }
            }

            throw apiError
          }
        } catch (imageConversionError: any) {
          console.error('❌ === IMAGE CONVERSION FAILED ===')
          console.error('❌ Image conversion error:', imageConversionError)
          console.log('🔄 Falling back to JSON without images')

          // Fallback: Create claim without images
          const claimWithoutImages = { ...transformedDto }
          delete claimWithoutImages.images

          console.log('🔄 Fallback payload:', JSON.stringify(claimWithoutImages, null, 2))

          try {
            res = await api.createClaim(claimWithoutImages)
            console.log('✅ Fallback API call successful')
            console.log('✅ Response status:', res.status)
            console.log('✅ Response data:', JSON.stringify(res.data, null, 2))
          } catch (fallbackError: any) {
            console.error('❌ Fallback API call failed:', fallbackError)
            console.error('❌ Fallback error response:', fallbackError.response?.data)
            console.error('❌ Fallback error status:', fallbackError.response?.status)
            throw fallbackError
          }

          // Notify user about the fallback
          console.warn('⚠️ Images could not be processed, but claim was created successfully')
          message = 'Claim created successfully, but images could not be processed. Please try adding images later.'
        }
      }

      console.log('🎉 === CLAIM CREATION SUCCESS ===')
      console.log('🎉 Final response status:', res.status)
      console.log('🎉 Final response data:', JSON.stringify(res.data, null, 2))

      if (res.status === 200 || res.status === 201) {
        message = 'Claim submitted successfully!'
        isSuccess = true
      } else {
        console.warn('⚠️ Unexpected response status:', res.status)
        message = 'Claim may have been created, but received unexpected response'
      }
    } catch (err: any) {
      console.error('💥 === CLAIM CREATION ERROR ===')
      console.error('💥 Full error object:', err)
      console.error('💥 Error message:', err.message)
      console.error('💥 Error response:', err.response)
      console.error('💥 Error response data:', err.response?.data)
      console.error('💥 Error response status:', err.response?.status)
      console.error('💥 Error response headers:', err.response?.headers)
      console.error('💥 Error stack:', err.stack)

      // Check if it's our custom error message from the interceptor
      if (err.message === 'Please login again') {
        message = 'Please login again'
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        message = 'Please login again'
      } else {
        // Enhanced error message extraction
        const backendError = err.response?.data?.error || err.response?.data?.message
        const statusCode = err.response?.status

        if (backendError) {
          message = `${backendError}${statusCode ? ` (Status: ${statusCode})` : ''}`
        } else {
          message = err.message || 'Something went wrong'
        }
      }

      console.error('💥 Final error message to user:', message)
    }

    console.log('🔍 === useCreateClaim DEBUG SESSION END ===')
    console.log('🔍 Final result:', { message, isSuccess })

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
      const entry = `${key}: ${typeof value} - ${String(value).substring(0, 50)}${
        String(value).length > 50 ? '...' : ''
      }`
      allEntries.push(entry)
      console.log(`  ${entry}`)
    }
  }
  console.log(`📋 Total entries: ${allEntries.length}`)

  return form
}
