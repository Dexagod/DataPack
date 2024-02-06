import { Parser, Store, DataFactory } from 'n3'
import { type Quad } from '@rdfjs/types'
import { importKey } from './sign'
import { type webcrypto, subtle } from 'crypto'
import type * as rdf from 'rdf-js'
import { hashDataGraph, signParams } from '../util/util'
import { type N3Package } from './n3util'

const { namedNode, defaultGraph, quad, literal } = DataFactory

async function getPubKey (issuer: string): Promise<webcrypto.CryptoKey> {
  const text = await fetch(issuer)
  const data = new Store(new Parser().parse(await text.text()))

  const objects = data.getObjects(namedNode(issuer), namedNode('http://www.w3.org/ns/auth/cert#key'), defaultGraph())
  if (objects.length !== 1) {
    throw new Error('Expected exactly one public key')
  }

  if (objects[0].termType !== 'Literal') {
    throw new Error('Not a literal')
  }

  return await importKey(objects[0].value)
}

export async function validatePackageSignatures (content: N3Package, publicKey: webcrypto.CryptoKey): Promise<boolean> {
  const store = new Store()
  store.addQuads(content)

  for (const { subject, object, graph } of store.match(null, namedNode('https://example.org/ns/signature#hasContentSignature'), null)) {
    const [content] = store.getObjects(subject, 'https://example.org/ns/package#content', graph)
    const signature = store.getObjects(object, 'https://example.org/ns/signature#proofValue', graph)[0].value

    const quads: Quad[] = []

    for (const { subject, predicate, object } of store.match(null, null, null, content)) {
      quads.push(quad(subject, predicate, object))
    }

    // Validation does not succeed
    if (!await verifyDataGraph(quads, signature, publicKey)) return false
  }
  return true
}

export async function validateSignatures (data: Store): Promise<void> {
  for (const { subject, object, graph } of data.match(null, namedNode('https://example.org/ns/signature#hasContentSignature'), null)) {
    const pub = await getPubKey(data.getObjects(object, namedNode('https://example.org/ns/signature#issuer'), graph)[0].value)
    const [content] = data.getObjects(subject, 'https://example.org/ns/package#content', graph)
    const signature = data.getObjects(object, 'https://example.org/ns/signature#proofValue', graph)[0].value

    const quads: Quad[] = []

    for (const { subject, predicate, object } of data.match(null, null, null, content)) {
      quads.push(quad(subject, predicate, object))
    }

    if (await verifyDataGraph(quads, signature, pub)) {
      data.add(
        quad(
          subject,
          namedNode('https://example.org/ns/signature#signatureHasBeenVerified'),
          literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean')),
          graph
        )
      )
    }
  }
}

export async function verifyDataGraph (input: rdf.Quad[], signature: string, publicKey: webcrypto.CryptoKey): Promise<boolean> {
  const signatureBuffer = Buffer.from(signature, 'base64')
  return await verify(publicKey, signatureBuffer, await hashDataGraph(input))
}

async function verify (publicKey: webcrypto.CryptoKey, signatureBuffer: ArrayBuffer, data: webcrypto.BufferSource): Promise<boolean> {
  return await subtle.verify(signParams, publicKey, signatureBuffer, data)
};
