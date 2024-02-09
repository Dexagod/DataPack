import { DataFactory } from 'n3'
import type * as rdf from 'rdf-js'

const pack = 'https://example.org/ns/package#'

/**
 * This function removes all package metadata
 */
export function unpackageAll (content: rdf.Quad[]): rdf.Quad[] {
  const contentGraphTerms = new Set()
  for (const quad of content) {
    if (quad.predicate.value === pack + 'content') {
      contentGraphTerms.add(quad.object)
    }
  }

  const filteredQuads = content.filter(quad => contentGraphTerms.has(quad.graph) && quad.predicate.value !== pack + 'package')
  return filteredQuads.map(quad => DataFactory.quad(quad.subject, quad.predicate, quad.object, DataFactory.defaultGraph()))
}

/**
 * This function removes the top level packages
 * (the packages in the default graph)
 *
 * TODO:: I can smell this is wildly inefficient
 */
export function unpackageOne (content: rdf.Quad[]): rdf.Quad[] {
  const graphsToRemove = new Set<rdf.Term>()
  const graphsToRename = new Set<rdf.Term>()

  // Filter the top-level package graphs
  for (const quad of content) {
    if (quad.predicate.value === pack + 'package' && quad.graph.termType === 'DefaultGraph') {
      graphsToRemove.add(quad.object)
    }
  }

  // Filter the content of the top level package graphs to rename
  for (const quad of content) {
    if (quad.predicate.value === pack + 'content' && graphsToRemove.has(quad.graph)) {
      graphsToRename.add(quad.object)
    }
  }

  // Remove top-level packages and rename the graphs of their content triples
  const resultingQuads: rdf.Quad[] = []
  for (const quad of content) {
    if (graphsToRemove.has(quad.graph)) {
      // _ignore
    } else if (graphsToRename.has(quad.graph)) {
      resultingQuads.push(
        DataFactory.quad(quad.subject, quad.predicate, quad.object, DataFactory.defaultGraph())
      )
    } else if (quad.predicate.value === pack + 'package' && quad.graph.termType === 'DefaultGraph') {
      // _ignore
    } else {
      resultingQuads.push(quad)
    }
  }
  return resultingQuads
}
