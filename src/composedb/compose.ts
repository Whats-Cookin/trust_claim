import { DIDSession } from 'did-session'
import type { AuthMethod } from '@didtools/cacao'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { ComposeClient } from '@composedb/client'

// @ts-ignore
import { definition } from './__generate__/trustclaims.js'

const client = new ComposeClient({ ceramic: 'http://localhost:7007', definition })

const LoadSession = async(authMethod?: AuthMethod):Promise<DIDSession | undefined> => {
  const sessionStr = localStorage.getItem('didsession')
  let session

  if (sessionStr) {
    session = await DIDSession.fromSession(sessionStr)
  }

  if (authMethod && (!session || (session.hasSession && session.isExpired))) {
    session = await DIDSession.authorize(authMethod, { resources: client.resources })
    client.setDID(session.did)
    localStorage.setItem('didsession', session.serialize())
  }

  return session
}

const PublishClaim = async(session: any, payload: any):Promise<any> => {
    console.log(session)
    // TODO here actually write the LinkedClaim built from the fields in payload (some fields of the claim will be empty)
    return {'status': 'success'}
}

export { client, LoadSession, PublishClaim };
