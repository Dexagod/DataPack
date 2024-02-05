import { DataFactory } from 'n3'
import { n3toQuadArray } from './util'
import type * as rdf from 'rdf-js'

const pack = 'https://example.org/ns/package#'

export function unPackageFromString (packageString: string): rdf.Quad[] {
  const packageN3Quads = n3toQuadArray(packageString)
  return unPackage(packageN3Quads)
}

export function unPackageFromN3Quads (packageN3Quads: rdf.Quad[]): rdf.Quad[] {
  return unPackage(packageN3Quads)
}

function unPackage (quads: rdf.Quad[]): rdf.Quad[] {
  const contentGraphTerms = new Set()
  for (const quad of quads) {
    if (quad.predicate.value === pack + 'content') {
      contentGraphTerms.add(quad.object)
    }
  }

  const filteredQuads = quads.filter(quad => contentGraphTerms.has(quad.graph) && quad.predicate.value !== pack + 'package')
  return filteredQuads.map(quad => DataFactory.quad(quad.subject, quad.predicate, quad.object, undefined))
}
