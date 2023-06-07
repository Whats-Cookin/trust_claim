import { DIDSession } from 'did-session'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import type { CeramicApi } from '@ceramicnetwork/common'
import type { ComposeClient } from '@composedb/client'
import { CERAMIC_URL } from '../utils/settings'
// import KeyDidResolver from 'key-did-resolver'
// import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'

/*
// If you are relying on an injected provider this must be here otherwise you will have a type error. 
// however this causes a type error with npm run build
declare global {
  interface Window {
    ethereum: any;
  }
}
*/

/**
 * Checks localStorage for a stored DID Session. If one is found we authenticate it, otherwise we create a new one.
 * @returns Promise<DID-Session> - The User's authenticated sesion.
 */
export const authenticateCeramic = async (ceramic: CeramicApi, compose: ComposeClient) => {
  const sessionStr = localStorage.getItem('did') // for production you will want a better place than localStorage for your sessions.
  let session
  console.log('In authenticate ceramic with sessionstr: ' + sessionStr)
  if (sessionStr) {
    session = await DIDSession.fromSession(sessionStr)
  }

  if (!session || (session.hasSession && session.isExpired)) {
    if (window.ethereum === null || window.ethereum === undefined) {
      throw new Error('No injected Ethereum provider found.')
    }

    // We enable the ethereum provider to get the user's addresses.
    const ethProvider = window.ethereum
    // request ethereum accounts.
    const addresses = await ethProvider.enable({
      method: 'eth_requestAccounts'
    })
    const accountId = await getAccountId(ethProvider, addresses[0])
    const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)

    console.log('got auth method: ' + authMethod)

    /**
     * Create DIDSession & provide capabilities that we want to access.
     * @NOTE: Any production applications will want to provide a more complete list of capabilities.
     *        This is not done here to allow you to add more datamodels to your application.
     */
    // TODO: update resources to only provide access to our composities
    session = await DIDSession.authorize(authMethod, {
      resources: ['ceramic://*?model=kjzl6hvfrbw6c7f8zr4bdyzfumj7hv7r9i7dbu57isrzezqjuetkum2885p9agc']
    })
    // Set the session in localStorage.
    if (session) {
      console.log('We got a did and authorized it: ' + JSON.stringify(session.serialize()))
      localStorage.setItem('did', session.serialize())
    } else {
      console.log('No did session for ' + authMethod)
    }
  }

  // const resolver = {
  //   ...KeyDidResolver.getResolver(),
  //   ...ThreeIdResolver.getResolver(ceramic),
  // }

  if (session) {
    // Set our Ceramic DID to be our session DID.
    console.log(
      'Setting the did for composedb to ' + JSON.stringify(session.did) + ' authenticated? ' + session.did.authenticated
    )
    compose.setDID(session.did)
    ceramic.did = session.did
  }

  return session
}
