import { createContext, useContext } from 'react'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'

import { CERAMIC_URL } from '../utils/settings.js'

// @ts-ignore
import { definition } from './__generated__/trustclaims.js'

/**
 * Configure ceramic Client & create context.
 */

export const ceramic = new CeramicClient(CERAMIC_URL)

export const composeClient = new ComposeClient({
  ceramic: CERAMIC_URL,
  // cast our definition as a RuntimeCompositeDefinition
  definition: definition as RuntimeCompositeDefinition
})

