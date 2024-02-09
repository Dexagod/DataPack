import type * as rdf from 'rdf-js'
import { type PackageOptions } from '../util/util'
import { packageContent as processContent } from '../pack/package'
import { type TrigPackage } from './trigUtil'

export async function packageContent (content: rdf.Quad[] | TrigPackage, options: PackageOptions): Promise<TrigPackage> {
  return await processContent<TrigPackage>(content, options)
}
