import type * as rdf from 'rdf-js'
import { signContent as genericSignContent } from '../pack/sign'
import { type webcrypto } from 'crypto'
import { type N3Package } from './n3util'

export async function signContent (content: N3Package | rdf.Quad[], issuer: string, privateKey: webcrypto.CryptoKey): Promise<N3Package> {
  return await genericSignContent<N3Package>(content, issuer, privateKey)
}
