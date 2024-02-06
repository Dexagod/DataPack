import { Parser } from 'n3'
import type * as rdf from 'rdf-js'
import { write } from '@jeswr/pretty-turtle'

export async function serializeN3PackageToN3String (content: N3Package): Promise<N3String> {
  return await N3QuadsToN3String(content)
}
export function parseN3StringToN3Package (content: N3String): N3Package {
  return N3StringToN3Quads(content)
}

export function N3StringToN3Quads (message: N3String): N3Quads {
  let quadArray = new Parser({ format: 'text/n3' }).parse(message)
  // Fixes bug in N3 parser for empty graph
  quadArray = quadArray.filter(q => q.subject && q.predicate && q.object)
  return quadArray
}

export async function N3QuadsToN3String (quads: N3Quads): Promise<N3String> {
  return await write(quads, { format: 'text/n3' })
}

export type N3Quads = rdf.Quad[]
export type N3String = string
export type N3Package = N3Quads
export type N3PackageString = N3String
