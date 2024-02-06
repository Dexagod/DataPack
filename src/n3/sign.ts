import type * as rdf from 'rdf-js'

import { type webcrypto } from 'crypto'
import { packageContent } from './package'
import { type N3Package } from './n3util'
import { signDataGraph } from '../sign/util'

// global.crypto = crypto

export async function signContent (content: N3Package | rdf.Quad[], issuer: string, privateKey: webcrypto.CryptoKey): Promise<N3Package> {
  const signature = await signDataGraph(content, privateKey)
  const signatureString = Buffer.from(signature).toString('base64')

  return await packageContent(content, {
    sign: {
      issuer,
      value: signatureString
    }
  })
}
