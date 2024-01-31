import { DataFactory, Parser } from 'n3'
import type * as rdf from 'rdf-js'
import { type Quads, RDFC10 } from 'rdfjs-c14n'

const pack = 'https://example.org/ns/package#'

export enum PackagePredicates {
  package = pack + 'package',
  content = pack + 'content',
  createdAt = pack + 'createdAt',
  actor = pack + 'actor',
  origin = pack + 'origin',
  hasContentPolicy = pack + 'hasContentPolicy',
  hasContentSignature = pack + 'hasContentSignature',
}

export function n3toQuadArray (message: string): rdf.Quad[] {
  let quadArray = new Parser({ format: 'text/n3' }).parse(message)
  // Fixes bug in N3 parser for empty graph
  quadArray = quadArray.filter(q => q.subject && q.predicate && q.object)
  return quadArray
}

export async function hashDataGraph (input: rdf.Quad[]): Promise<Uint8Array> {
  const rdfc10 = new RDFC10(DataFactory)
  const normalized: Quads = (await rdfc10.c14n(input)).canonicalized_dataset
  const hash: string = await rdfc10.hash(normalized)
  return new TextEncoder().encode(hash)
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
