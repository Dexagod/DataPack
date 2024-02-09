import type * as rdf from 'rdf-js'
import { type TrigPackage } from './trigUtil'
import { unpackageOne as genericUnpackOne, unpackageAll as genericUnpackAll } from '../pack/unpackage'

/**
 * This function removes the top level packages
 * (the packages in the default graph)
 */
export function unpackageOne (content: TrigPackage): rdf.Quad[] | TrigPackage {
  return genericUnpackOne(content)
}

/**
 * This function removes all package metadata
 */
export function unpackageAll (content: TrigPackage): rdf.Quad[] {
  return genericUnpackAll(content)
}
