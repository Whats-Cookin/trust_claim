import React, { useCallback } from 'react'
import axios from '../axiosInstance'
import { PublishClaim } from '../composedb/compose'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any) => {
    let res, claim,
      message = 'Something went wrong!',
      isSuccess = false
    try {
      // TODO better way of checking the login method

      // check if the user is authenticated with metamask and has did
      const did = localStorage.getItem('did')
      const ethAddress = localStorage.getItem('ethAddress')

      if (did && ethAddress) {
        console.log("User has did " + did + " and ethaddress " + ethAddress + " so publishing to ceramic")
        try {
           let claim = await PublishClaim(payload)
        } catch (err) {
           console.log("Error trying to publish claim to ceramic: " + err)
        }
      } 
      // if we got a claim, include the address
      if (claim) {
         console.log("Published to ceramic! " + JSON.stringify(claim))
         try {
            payload['claimAddress'] = claim['data']['createLinkedClaim']['document']['id']
            console.log('added claim address')
         } catch (err) {
            console.log("could not extract claim address")
         }
      }
      res = await axios.post('/api/claim', payload)

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
