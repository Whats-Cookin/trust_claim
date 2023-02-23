import { DIDSession } from 'did-session'
import type { AuthMethod } from '@didtools/cacao'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { ComposeClient } from '@composedb/client'

// @ts-ignore
import { definition } from './__generate__/trustclaims.js'

const ethProvider = await window.ethereum.request({ method: 'eth_requestAccounts' });
const addresses = await ethProvider.enable()
const accountId = await getAccountId(ethProvider, addresses[0])
const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)

const loadSession = async(authMethod: AuthMethod):Promise<DIDSession> => {
  const sessionStr = localStorage.getItem('didsession')
  let session

  if (sessionStr) {
    session = await DIDSession.fromSession(sessionStr)
  }

  if (!session || (session.hasSession && session.isExpired)) {
    session = await DIDSession.authorize(authMethod, { resources: []})
    localStorage.setItem('didsession', session.serialize())
  }

  return session
}

const client = new ComposeClient({ ceramic: 'http://localhost:7007', definition })
const resources = client.resources
const session = await DIDSession.authorize(authMethod, { resources })
client.setDID(session.did)


console.log(session)

export { client };
