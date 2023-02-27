import { DIDSession } from 'did-session'
import type { AuthMethod } from '@didtools/cacao'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { ComposeClient } from '@composedb/client'

// @ts-ignore
import { definition } from './__generate__/trustclaims.js'

// TODO use an env variable loaded in utils/settings for the ceramic host
const client = new ComposeClient({ ceramic: 'http://localhost:7007', definition })

// these are run in handleWalletAuth()
//const ethProvider = await window.ethereum.request({ method: 'eth_requestAccounts' });
//const addresses = await ethProvider.enable()
//const accountId = await getAccountId(ethProvider, addresses[0])
//const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)

const LoadSession = async(authMethod?: AuthMethod):Promise<DIDSession> => {
  const sessionStr = localStorage.getItem('didsession')
  let session

  if (sessionStr) {
    session = await DIDSession.fromSession(sessionStr)
  }

  if (authMethod && (!session || (session.hasSession && session.isExpired))) {
    session = await DIDSession.authorize(authMethod, { client.resources })
    client.setDID(session.did)
    localStorage.setItem('didsession', session.serialize())
  }

  return session
}

// moved these into the loadSession function which is called from handleWalletAuth()
//const resources = client.resources
//const session = await DIDSession.authorize(authMethod, { resources })
//client.setDID(session.did)

const PublishClaim = async(session: any, payload: any):Promise<boolean> => {

 // TODO here actually write the LinkedClaim built from the fields in payload (some fields of the claim will be empty)

}

export { client, LoadSession, PublishClaim };
