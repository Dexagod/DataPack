import type * as rdf from 'rdf-js'
import { type webcrypto } from 'crypto'
import { packageContent } from './package'
import { signDataGraph } from '../sign/util'

export async function signContent<T> (content: rdf.Quad[], issuer: string, privateKey: webcrypto.CryptoKey): Promise<T> {
  const signature = await signDataGraph(content, privateKey)
  const signatureString = Buffer.from(signature).toString('base64')

  return await packageContent(content, {
    sign: {
      issuer,
      value: signatureString
    }
  })
}
