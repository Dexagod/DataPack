import type * as rdf from 'rdf-js'
import { signContent as genericSignContent } from '../pack/sign'
import { type webcrypto } from 'crypto'
import { type TrigPackage } from './trigUtil'

export async function signContent (content: TrigPackage | rdf.Quad[], issuer: string, privateKey: webcrypto.CryptoKey): Promise<TrigPackage> {
  return await genericSignContent<TrigPackage>(content, issuer, privateKey)
}
