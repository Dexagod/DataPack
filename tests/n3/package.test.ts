import 'jest-rdf' // This is not working correctly somehow
import { describe, expect, test } from '@jest/globals'
import { DataFactory, Store, type Literal } from 'n3'
import { testIsomorphism } from '../util/utils'
import { type Quad } from 'rdf-js'
import { packageContent } from '../../src/n3'
import { PackagePredicates } from '../../src/util/util'

// TODO:: Mocking readFileSync is not working so I'm ignoring it atm
describe('Packaging module', () => {
  const contentQuads: Quad[] = [
    DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      undefined
    )]

  test('Expect empty options to add package without any metadata', async () => {
    const p = await packageContent(contentQuads, {})
    const store = new Store()
    store.addQuads(p)

    // Test pack:package quad
    const quads1 = store.getQuads(null, 'https://example.org/ns/package#package', null, null)
    expect(quads1.length).toEqual(1)
    const packageGraphTerm = quads1[0].object

    // Test pack:content quad
    const quads2 = store.getQuads(null, 'https://example.org/ns/package#content', null, packageGraphTerm)
    expect(quads2.length).toEqual(1)
    const contentGraphTerm = quads2[0].object

    const testQuads = store.getQuads(null, null, null, contentGraphTerm)
    expect(testQuads.length).toEqual(1)
    testIsomorphism(testQuads, [DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      testQuads[0].graph
    )])
  })

  test('Expect timeStamp option to add creation date metadata to package', async () => {
    const p = await packageContent(contentQuads, { timeStamp: true })
    const store = new Store()
    store.addQuads(p)

    // Test pack:package quad
    const quads1 = store.getQuads(null, 'https://example.org/ns/package#package', null, null)
    expect(quads1.length).toEqual(1)
    const packageGraphTerm = quads1[0].object

    const testQuads = store.getQuads(null, PackagePredicates.createdAt, null, packageGraphTerm)
    expect(testQuads.length).toEqual(1)
    expect(testQuads[0].object.termType).toEqual('Literal')
    expect((testQuads[0].object as Literal).datatype).toEqual(DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime'))
  })
})
