import React, { useCallback } from 'react'
import axios from '../axiosInstance'
import { PublishClaim } from '../composedb/compose'
import { authenticateCeramic, ceramic, composeClient } from '../composedb'

export function useCreateClaim() {
  const createClaim = useCallback(async (payload: any) => {
    let res,
      claim,
      message = 'Something went wrong!',
      isSuccess = false
    try {
      // TODO better way of checking the login method

      // check if the user is authenticated with metamask and has did
      const did = localStorage.getItem('did')
      const ethAddress = localStorage.getItem('ethAddress')

      // Check if the user is authenticated with email
      const accessToken = localStorage.getItem('accessToken')

      let claim
      if (did && ethAddress) {
        console.log('User has did ' + did + ' and ethaddress ' + ethAddress + ' so publishing to ceramic')
        // quick fix for "Ceramic instance is not authenticated" error
        if (!ceramic.did) {
          try {
            const session = await authenticateCeramic(ceramic, composeClient)
            console.log(`Session: ${JSON.stringify(session)}`)
          } catch (error) {
            console.log(`Error authenticating ceramic instance: Error message: ${error}`)
          }
        }
        try {
          claim = await PublishClaim(payload)
        } catch (err) {
          console.log('Error trying to publish claim to ceramic: ' + err)
        }
      }

      if (accessToken) {
        console.log('User has accessToken ' + accessToken + ' so publishing to ceramic')
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
