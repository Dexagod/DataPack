import { DataFactory, Parser, type Store } from 'n3'
import type * as rdf from 'rdf-js'
import { write } from '@jeswr/pretty-turtle'
import { PackagePredicates } from '../util/util'

export type N3Quads = rdf.Quad[]
export type N3String = string
export type N3Package = N3Quads
export type N3PackageString = N3String

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
  return (await write(quads, { format: 'text/n3' })).replace(/^\s*\n/gm, '')
}

/**
 * 1. check if package exists.
 * 2. get the content graph from package
 * 3. forward chain all content, and every object that is also a graph recursively add
 */
export function extractPackageContents (store: Store, packageTerm: rdf.Term): N3Quads {
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

function retrieveGraphContents (store: Store, graphTerm: rdf.Term, validationList: rdf.Term[] = []): N3Quads {
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
