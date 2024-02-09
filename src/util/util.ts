import { DataFactory, type Store } from 'n3'
import type * as rdf from 'rdf-js'
import { type Quads, RDFC10 } from 'rdfjs-c14n'

export enum PackageFormat {
  n3,
  trig,
}

const pack = 'https://example.org/ns/package#'
const sign = 'https://example.org/ns/signature#'

export interface PackageOptions {
  actor?: string // Actor responsible for the packaging
  origin?: string // Origin of the packaged data
  documentUri?: string // URI of the document -- TODO:: remove this and make inverse relation
  contentType?: string // content type of the content
  policy?: { // Policies of the content
    duration?: string // Duration for which the receiving actor can use the data, takes a XSD duration
    purpose?: string // Purpose of the packaging - Usage Policy, takes a URL input of the purpose
    issuer: string // Issuer of the signature
  }
  sign?: { // Signature of the content
    value: string // Signature value
    issuer: string // Issuer of the signature
  }
  timeStamp?: boolean
  quads?: rdf.Quad[] // Replaces the blankNode with name value "package" for the package blank node
}

export enum PackagePredicates {
  package = pack + 'package',
  content = pack + 'content',
  createdAt = pack + 'createdAt',
  actor = pack + 'actor',
  origin = pack + 'origin',
  hasContentPolicy = pack + 'hasContentPolicy',
  hasContentSignature = pack + 'hasContentSignature',
}

export enum SignaturePredicates {
  issuer = sign + 'issuer',
  created = sign + 'created',
  proofValue = sign + 'proofValue',
}

export const signatureType: string = sign + 'Signature'

export async function hashDataGraph (input: rdf.Quad[]): Promise<Uint8Array> {
  const rdfc10 = new RDFC10(DataFactory)
  const normalized: Quads = (await rdfc10.c14n(input)).canonicalized_dataset
  const hash: string = await rdfc10.hash(normalized)
  return new TextEncoder().encode(hash)
}

/**
 * 1. check if package exists.
 * 2. get the content graph from package
 * 3. forward chain all content, and every object that is also a graph recursively add
 */
export function extractPackageContents (store: Store, packageTerm: rdf.Term): rdf.Quad[] {
  let contentGraph: rdf.Term
  const packageGraph = store.getQuads(packageTerm, PackagePredicates.package, null, null)[0]?.object
  if (packageGraph) {
    contentGraph = store.getQuads(null, PackagePredicates.content, null, packageGraph)[0]?.object
  } else {
    contentGraph = store.getQuads(packageTerm, PackagePredicates.content, null, null)[0]?.object
  }
  if (!contentGraph) {
    console.error(`Could not find package for identifier ${packageTerm.value.toString()}`)
    return []
  }
  const contentGraphQuads = retrieveGraphContents(store, contentGraph)
  return contentGraphQuads.map(
    q => q.graph.equals(contentGraph)
      ? DataFactory.quad(q.subject, q.predicate, q.object, DataFactory.defaultGraph())
      : q
  )
}

function retrieveGraphContents (store: Store, graphTerm: rdf.Term, validationList: rdf.Term[] = []): rdf.Quad[] {
  if (validationList.includes(graphTerm)) return []
  const newValidationList = validationList.concat(graphTerm)
  let results: rdf.Quad[] = []
  const quads = store.getQuads(null, null, null, graphTerm)
  results = results.concat(quads)
  for (const quad of quads) {
    results = results.concat(retrieveGraphContents(store, quad.object, newValidationList))
  }
  return results
}

export const keyParams = {
  name: 'ECDSA',
  namedCurve: 'P-384'
}

export const signParams = {
  name: keyParams.name,
  hash: 'SHA-512'
}

export type N3String = string
export type N3Quads = rdf.Quad[]
