import type * as rdf from 'rdf-js'

import { subtle, type webcrypto } from 'crypto'
import { packageContentQuads, packageContentString } from './package'
import { type N3String, hashDataGraph, keyParams, n3toQuadArray, signParams } from './util'

// global.crypto = crypto

export async function createContentSignatureFromN3String (content: string, privateKey: webcrypto.CryptoKey): Promise<string> {
  const signature = await signDataGraph(n3toQuadArray(content), privateKey)
  return Buffer.from(signature).toString('base64')
}

export async function createContentSignatureFromQuads (content: rdf.Quad[], privateKey: webcrypto.CryptoKey): Promise<string> {
  const signature = await signDataGraph(content, privateKey)
  return Buffer.from(signature).toString('base64')
}

export async function signContentString (content: string, issuer: string, privateKey: webcrypto.CryptoKey): Promise<N3String> {
  const signatureString = await createContentSignatureFromN3String(content, privateKey)

  return await packageContentString(content, {
    sign: {
      issuer,
      value: signatureString
    }
  })
}

export async function signContentQuads (content: rdf.Quad[], issuer: string, privateKey: webcrypto.CryptoKey): Promise<N3String> {
  const signature = await signDataGraph(content, privateKey)
  const signatureString = Buffer.from(signature).toString('base64')

  return await packageContentQuads(content, {
    sign: {
      issuer,
      value: signatureString
    }
  })
}

async function signDataGraph (input: rdf.Quad[], privateKey: webcrypto.CryptoKey): Promise<ArrayBuffer> {
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
