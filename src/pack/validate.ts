import { Store, DataFactory } from 'n3'
import { type webcrypto, subtle } from 'crypto'
import type * as rdf from 'rdf-js'
import { PackagePredicates, SignaturePredicates, extractPackageContents, hashDataGraph, signParams } from '../util/util'

export type KeyMap = Map<string, webcrypto.CryptoKey>

const { namedNode } = DataFactory

export async function validateSignatures (content: rdf.Quad[], keyMap: KeyMap): Promise<boolean> {
  const store = new Store()
  store.addQuads(content)

  for (const { subject, object, graph } of store.match(null, namedNode(PackagePredicates.hasContentSignature), null)) {
    const signature = store.getObjects(object, SignaturePredicates.proofValue, graph)[0].value
    const issuer = store.getObjects(object, SignaturePredicates.issuer, graph)[0].value

    const contentQuads = extractPackageContents(store, subject)

    const key = keyMap.get(issuer)

    if (!signature) {
      console.error(`No signature value found for package ${object.value.toString()}`)
      return false
    }
    if (!issuer) {
      console.error(`No signature issuer found for package ${object.value.toString()}`)
      return false
    }
    if (!key) {
      console.error(`No public key found for ${issuer} in passed keyMap`)
      return false
    }
    const verify = await verifyDataGraph(contentQuads, signature, key)
    if (!verify) {
      console.error(`Could not verify the signature for ${issuer} in package ${object.value.toString()}`)
      return false
    }
  }
  return true
}

async function verifyDataGraph (input: rdf.Quad[], signature: string, publicKey: webcrypto.CryptoKey): Promise<boolean> {
  const signatureBuffer = Buffer.from(signature, 'base64')
  return await verify(publicKey, signatureBuffer, await hashDataGraph(input))
}

async function verify (publicKey: webcrypto.CryptoKey, signatureBuffer: ArrayBuffer, data: webcrypto.BufferSource): Promise<boolean> {
  return await subtle.verify(signParams, publicKey, signatureBuffer, data)
};

// TODO:: specify how keys should be stored

// async function getPubKey (issuer: string): Promise<webcrypto.CryptoKey> {
//   const text = await fetch(issuer)
//   const data = new Store(new Parser().parse(await text.text()))

//   const objects = data.getObjects(namedNode(issuer), namedNode('http://www.w3.org/ns/auth/cert#key'), defaultGraph())
//   if (objects.length !== 1) {
//     throw new Error('Expected exactly one public key')
//   }

//   if (objects[0].termType !== 'Literal') {
//     throw new Error('Not a literal')
//   }

//   return await importKey(objects[0].value)
// }

// export async function validateSignatures (data: Store): Promise<void> {
//   for (const { subject, object, graph } of data.match(null, namedNode('https://example.org/ns/signature#hasContentSignature'), null)) {
//     const pub = await getPubKey(data.getObjects(object, namedNode('https://example.org/ns/signature#issuer'), graph)[0].value)
//     const [content] = data.getObjects(subject, 'https://example.org/ns/package#content', graph)
//     const signature = data.getObjects(object, 'https://example.org/ns/signature#proofValue', graph)[0].value

//     const quads: Quad[] = []

//     for (const { subject, predicate, object } of data.match(null, null, null, content)) {
//       quads.push(quad(subject, predicate, object))
//     }

//     if (await verifyDataGraph(quads, signature, pub)) {
//       data.add(
//         quad(
//           subject,
//           namedNode('https://example.org/ns/signature#signatureHasBeenVerified'),
//           literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean')),
//           graph
//         )
//       )
//     }
//   }
// }
