import React, { useCallback } from 'react'
import axios from '../axiosInstance'
import { PublishClaim } from '../composedb/compose'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any) => {
    let res,
      message = 'Something went wrong!',
      isSuccess = false
    try {
      // TODO better way of checking the login method

      // check if the user is authenticated with metamask and has did
      const did = localStorage.getItem('did')
      const ethAddress = localStorage.getItem('ethAddress')

      if (did && ethAddress) {
        console.log('User has did ' + did + ' and ethaddress ' + ethAddress + ' so publishing to ceramic')
        res = await PublishClaim(payload)
      } else {
        console.log('No did, just publishing to prism')
        // if user is not auththicatesd with Metamask and/or do not have a did
        res = await axios.post('/api/claim', payload)
      }

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
