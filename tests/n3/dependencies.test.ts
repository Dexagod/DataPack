/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-rdf' // This is not working correctly somehow
import { describe, test } from '@jest/globals'
import { DataFactory, Parser } from 'n3'
import { write } from '@jeswr/pretty-turtle'
import { testIsomorphism } from '../util/utils'

describe('Module dependencies', () => {
  test('Expect N3Quads serialization and parsing roundtrip to remain constant', async () => {
    const g = DataFactory.blankNode('g')
    const contentQuads = [
      DataFactory.quad(
        DataFactory.namedNode('http://example.org/ns#a'),
        DataFactory.namedNode('http://example.org/ns#b'),
        g,
        DataFactory.defaultGraph()
      ),
      DataFactory.quad(
        DataFactory.namedNode('http://example.org/ns#x'),
        DataFactory.namedNode('http://example.org/ns#y'),
        DataFactory.namedNode('http://example.org/ns#z'),
        g
      )
    ]

    const serialization = await write(contentQuads, { format: 'text/n3' })
    const parsedQuads = new Parser({ format: 'text/n3' }).parse(serialization)

    testIsomorphism(contentQuads, parsedQuads)
  })
})
