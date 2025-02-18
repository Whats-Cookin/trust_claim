import { useCallback } from 'react'
import axios from '../axiosInstance'
import { MediaI } from '../components/Form/imageUploading'
import { ceramic, composeClient } from '../composedb'
import { PublishClaim } from '../composedb/compose'
import { canSignClaims, initializeDIDAuth } from '../utils/authUtils'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any) => {
    let message = 'Something went wrong!';
    let isSuccess = false;

    try {
      // Check if we can sign claims with DID
      if (canSignClaims()) {
        // Ensure ceramic is authenticated
        if (!ceramic.did) {
          console.log('Initializing DID authentication...'); // Debugging log
          await initializeDIDAuth(ceramic, composeClient);
          console.log('DID authentication successful!'); // Debugging log
        }

        try {
          const claim = await PublishClaim(payload);
          if (claim) {
            console.log('Published to ceramic!', claim); // Debugging log
            try {
              payload['claimAddress'] = claim['data']['createLinkedClaim']['document']['id'];
            } catch (err) {
              console.warn('Could not extract claim address:', err); // Debugging log
            }
          }
        } catch (err) {
          console.error('Error publishing claim to ceramic:', err); // Debugging log
          throw err; // Rethrow the error to stop further execution
        }
      }

      const { images, dto } = preparePayload(payload);
      console.log('Sending payload:', dto, images); // Debugging log

      const res = await axios.post('/api/claim/v2', generateFormData(dto, images), {
        timeout: 30000, // Increase timeout to 30 seconds
      });
      console.log('API Response:', res.data); // Debugging log

      if (res.status === 201) {
        message = 'Claim submitted successfully!';
        isSuccess = true;
      }
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        console.error('Request timed out:', err.message);
        message = 'Request timed out. Please try again.';
      } else {
        console.error('API Error:', err.response?.data || err.message);
        message = err.response?.data.message || 'Something went wrong';
      }
    }

    return { message, isSuccess };
  }, []);

  return { createClaim };
}
function preparePayload<T extends { images?: MediaI[] }>(
  payload: T
): { dto: Omit<T, 'images'> & { images: Omit<MediaI, 'file' | 'url'>[] }; images: File[] } {
  const images: File[] = [];

  const did = localStorage.getItem('did');

  const dto = {
    ...payload,
    ...(did && { issuerId: did }),
    images: payload.images?.map(image => {
      if (image.file) {
        images.push(image.file);
      }
      return {
        metadata: image.metadata,
        effectiveDate: image.effectiveDate,
      } as Omit<MediaI, 'file' | 'url'>;
    }) || [], // Default to an empty array if payload.images is undefined
  };

  return { images, dto };
}

function generateFormData(dto: unknown, images: File[]): FormData {
  const form = new FormData();

  // Ensure dto is a valid object
  if (dto && typeof dto === 'object') {
    form.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
  } else {
    throw new Error('Invalid dto');
  }

  // Ensure images is an array of files
  if (Array.isArray(images)) {
    for (const img of images) {
      if (img instanceof File) {
        form.append('images', img);
      }
    }
  } else {
    throw new Error('Invalid images');
  }

  return form;
}