import type * as rdf from 'rdf-js'
import { type PackageOptions } from '../util/util'
import { type N3Package } from './n3util'
import { packageContent as processContent } from '../pack/package'

export async function packageContent (content: rdf.Quad[] | N3Package, options: PackageOptions): Promise<N3Package> {
  return await processContent<N3Package>(content, options)
}
