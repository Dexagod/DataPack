import { DataFactory } from 'n3'
import type * as rdf from 'rdf-js'
import { type N3Package } from './n3util'

const pack = 'https://example.org/ns/package#'

/**
 * This function removes the top level packages
 * (the packages in the default graph)
 */
export function unpackageOne (content: N3Package): rdf.Quad[] | N3Package {
  return removeOnePackage(content)
}

/**
 * This function removes all package metadata
 */
export function unpackageAll (content: N3Package): rdf.Quad[] {
  return removeAllPackages(content)
}

function removeAllPackages (quads: rdf.Quad[]): rdf.Quad[] {
  const contentGraphTerms = new Set()
  for (const quad of quads) {
    if (quad.predicate.value === pack + 'content') {
      contentGraphTerms.add(quad.object)
    }
  }

  const filteredQuads = quads.filter(quad => contentGraphTerms.has(quad.graph) && quad.predicate.value !== pack + 'package')
  return filteredQuads.map(quad => DataFactory.quad(quad.subject, quad.predicate, quad.object, DataFactory.defaultGraph()))
}

// TODO:: I can smell this is wildly inefficient
function removeOnePackage (quads: rdf.Quad[]): rdf.Quad[] | N3Package {
  const graphsToRemove = new Set<rdf.Term>()
  const graphsToRename = new Set<rdf.Term>()

  // Filter the top-level package graphs
  for (const quad of quads) {
    if (quad.predicate.value === pack + 'package' && quad.graph.termType === 'DefaultGraph') {
      graphsToRemove.add(quad.object)
    }
  }

  // Filter the content of the top level package graphs to rename
  for (const quad of quads) {
    if (quad.predicate.value === pack + 'content' && graphsToRemove.has(quad.graph)) {
      graphsToRename.add(quad.object)
    }
  }

  // Remove top-level packages and rename the graphs of their content triples
  const resultingQuads: rdf.Quad[] = []
  for (const quad of quads) {
    if (graphsToRemove.has(quad.graph)) {
      // _ignore
    } else if (graphsToRename.has(quad.graph)) {
      resultingQuads.push(
        DataFactory.quad(quad.subject, quad.predicate, quad.object, DataFactory.defaultGraph())
      )
    } else {
      resultingQuads.push(quad)
    }
  }
  return resultingQuads
}
