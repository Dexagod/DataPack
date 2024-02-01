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
import type { Readable } from 'node:stream'
import { write } from '@jeswr/pretty-turtle'

const packageMimeType = 'text/n3-package'

/**
 * Converts `internal/quads` to a packaged N3 format.
 */
export class PackagingConverter extends BaseTypedRepresentationConverter {
  public constructor () {
    console.log('PackagingConverter constructor called')
    const outputPreference: Record<string, number> = { 'text/n3-package': 1 }
    super(
      INTERNAL_QUADS,
      outputPreference
    )
  }

  public async handle ({ identifier, representation: quads, preferences }: RepresentationConverterArgs):
  Promise<Representation> {
    console.log('PackagingConverter handle called', identifier, quads, preferences)

    // Can not be undefined if the `canHandle` call passed
    const contentType = packageMimeType
    let data: Readable

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

    const dataQuads: Quad[] = []
    quads.data.on('data', q => { dataQuads.push(q as Quad) })

    // Convert RDF/JS quads into a Notation3 string
    const str = await write(dataQuads, {
      format: 'text/n3'
    })
    return new BasicRepresentation(str, quads.metadata, contentType)
  }
}
