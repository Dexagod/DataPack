import type * as rdf from 'rdf-js'
import { subtle, type webcrypto } from 'crypto'
import { hashDataGraph, keyParams, signParams } from '../util/util'

export async function signDataGraph (input: rdf.Quad[], privateKey: webcrypto.CryptoKey): Promise<ArrayBuffer> {
  return await sign(privateKey, await hashDataGraph(input))
}

export async function generateKeyPair (): Promise<webcrypto.CryptoKeyPair> {
  return await subtle.generateKey(keyParams, true, ['sign', 'verify'])
}

export async function importKey (key: string): Promise<webcrypto.CryptoKey> {
  return await subtle.importKey('raw', Buffer.from(key, 'base64'), keyParams, true, ['verify'])
}

async function sign (privateKey: webcrypto.CryptoKey, buffer: webcrypto.BufferSource): Promise<ArrayBuffer> {
  return await subtle.sign(signParams, privateKey, buffer)
};
