import {
  BaseTypedRepresentationConverter,
  INTERNAL_QUADS,
  SOLID_META,
  type Representation,
  type RepresentationConverterArgs,
  transformSafely,
  BasicRepresentation
} from '@solid/community-server'
import { DataFactory } from 'n3'
import type { Quad } from '@rdfjs/types'

import { packageContentQuadsToN3Quads, packageContentQuads } from '../../../../packaging/index'

const packageMimeType = 'text/n3-package'

/**
 * Converts `internal/quads` to a packaged N3 format.
 */
export class QuadToPackageConverter extends BaseTypedRepresentationConverter {
  
  baseUrl: string;

  public constructor (baseUrl: string) {
    const outputPreference: Record<string, number> = { 'text/n3-package': 1 }
    super(
      INTERNAL_QUADS,
      outputPreference
    )
    this.baseUrl = baseUrl;  
  }

  public async handle ({ identifier, representation: quads, preferences }: RepresentationConverterArgs):
  Promise<Representation> {

    // Can not be undefined if the `canHandle` call passed
    const contentType = packageMimeType

    // Remove the ResponseMetadata graph as we never want to see it in a serialization
    // Note that this is a temporary solution as indicated in following comment:
    // https://github.com/CommunitySolidServer/CommunitySolidServer/pull/1188#discussion_r853830903
    quads.data = transformSafely<Quad>(quads.data, {
      objectMode: true,
      transform (quad: Quad): void {
        if (quad.graph.equals(SOLID_META.terms.ResponseMetadata)) {
          this.push(DataFactory.quad(quad.subject, quad.predicate, quad.object))
        } else {
          this.push(quad)
        }
      }
    })

    // Convert Steam<Quad> to Quad[]
    const dataQuads: Quad[] = await new Promise((resolve, reject) => {
      const streamQuads: Quad[] = []
      quads.data.on('data', q => { streamQuads.push(q as Quad) })
      quads.data.on('close', () => { resolve(streamQuads) })
    })
    
    // Create Package string
    const packageString = await packageContentQuads(dataQuads, {
      timeStamp: true,
      actor: this.baseUrl,
      origin: identifier.path
    }, {
      prefixes: { pack: "https://example.org/ns/package#" }
    })

    return new BasicRepresentation(packageString, quads.metadata, contentType)

    // // Convert RDF/JS quads into a Notation3 string
    // const str = await write(dataQuads, {
    //   format: 'text/n3'
    // })
    // console.log(str)
    // return new BasicRepresentation(str, quads.metadata, contentType)
  }
}
