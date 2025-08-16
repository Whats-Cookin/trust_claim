// Enhanced Web3 Authentication with BYO-DID support
import { ethers } from 'ethers'
import {
  LinkedClaim,
  LinkedClaimProof,
  toLinkedClaim,
  prepareDIDSigning,
  DIDSigningContext
} from '../lib/sign-linked-claim'

interface SignedClaim {
  claim: any
  signature: string
  signerAddress: string
  signerDid?: string
}

interface UserIdentity {
  address?: string
  did?: string
  idType: 'DID' | 'ETHEREUM_ADDRESS'
}

// Check if MetaMask is available
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
}

// Connect to MetaMask and get account
export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed')
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    return accounts[0]
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

// Get current connected account
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    })
    return accounts[0] || null
  } catch (error) {
    console.error('Failed to get current account:', error)
    return null
  }
}

// Create a DID from Ethereum address
export const createDidFromAddress = (address: string): string => {
  // Using did:ethr method for Ethereum addresses
  return `did:ethr:${address.toLowerCase()}`
}

// Get user's identity (custom DID or Ethereum-based)
export const getUserIdentity = (): UserIdentity => {
  // Check if user has set a custom DID
  const customDid = localStorage.getItem('userDid')
  if (customDid) {
    return {
      did: customDid,
      idType: 'DID'
    }
  }

  // Check if user has Ethereum address
  const ethAddress = localStorage.getItem('ethAddress')
  if (ethAddress) {
    return {
      address: ethAddress,
      did: createDidFromAddress(ethAddress),
      idType: 'DID'
    }
  }

  // Check if user wants to use raw Ethereum address
  const useRawAddress = localStorage.getItem('useRawEthAddress') === 'true'
  if (useRawAddress && ethAddress) {
    return {
      address: ethAddress,
      idType: 'ETHEREUM_ADDRESS'
    }
  }

  return {
    idType: 'DID'
  }
}

// Set custom DID
export const setCustomDid = (did: string) => {
  if (did && did.startsWith('did:')) {
    localStorage.setItem('userDid', did)
    localStorage.setItem('userIdType', 'DID')
  } else {
    throw new Error('Invalid DID format')
  }
}

// Clear custom DID (revert to Ethereum-based)
export const clearCustomDid = () => {
  localStorage.removeItem('userDid')
  localStorage.removeItem('userIdType')
}

// Sign a claim with MetaMask
export const signClaim = async (claim: any): Promise<SignedClaim> => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  // Get user's identity preference
  const identity = getUserIdentity()

  // Convert to LinkedClaim format
  const linkedClaim = toLinkedClaim(claim)

  // Prepare signing context
  const context: DIDSigningContext = {
    signerAddress: address,
    signerDID: identity.did || createDidFromAddress(address)
  }

  // Get canonical message
  const { message } = prepareDIDSigning(linkedClaim, context)

  // Sign the message
  const signature = await signer.signMessage(message)

  return {
    claim: {
      ...claim,
      issuerId: identity.did || identity.address || createDidFromAddress(address),
      issuerIdType: identity.idType
    },
    signature,
    signerAddress: address,
    signerDid: identity.did
  }
}

// Verify a signature
export const verifySignature = async (
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

// Generate a proof object for the claim
export const generateProof = (signature: string, signerAddress: string, signerId?: string): LinkedClaimProof => {
  return {
    type: 'EthereumEip712Signature2021',
    created: new Date().toISOString(),
    verificationMethod: signerId || createDidFromAddress(signerAddress),
    proofPurpose: 'assertionMethod',
    proofValue: signature,
    // Include Ethereum address for verification
    ethereumAddress: signerAddress
  }
}

// Sign and prepare claim for submission
export const signAndPrepareClaim = async (claimData: any): Promise<any> => {
  const signedClaim = await signClaim(claimData)

  // Prepare the proof object
  const proof = generateProof(signedClaim.signature, signedClaim.signerAddress, signedClaim.signerDid)

  // Return claim data with proof and proper issuer fields
  return {
    ...claimData, // Keep original claim data
    issuerId: signedClaim.signerDid || `did:ethr:${signedClaim.signerAddress.toLowerCase()}`,
    issuerIdType: 'DID', // When signing with MetaMask, it's always a DID
    proof: proof // This will be the proof object with signature
  }
}

// UI Helper: Get display name for current identity
export const getIdentityDisplayName = (): string => {
  const identity = getUserIdentity()

  if (identity.did) {
    // Shorten DIDs for display
    if (identity.did.length > 20) {
      return `${identity.did.slice(0, 15)}...${identity.did.slice(-4)}`
    }
    return identity.did
  }

  if (identity.address) {
    return `${identity.address.slice(0, 6)}...${identity.address.slice(-4)}`
  }

  return 'No identity set'
}

// Check if user has any identity
export const hasIdentity = (): boolean => {
  const identity = getUserIdentity()
  return !!(identity.did || identity.address)
}
