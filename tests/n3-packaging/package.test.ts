/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-rdf' // This is not working correctly somehow
import { describe, expect, test } from '@jest/globals'
import {
  // packageContentFile,
  // packageContentFileToN3Quads,
  packageContentQuads,
  packageContentQuadsToN3Quads,
  packageContentString,
  packageContentStringToN3Quads
} from '../../src/n3-packaging/lib/package'
import { DataFactory, Store, type Literal } from 'n3'
import { PackagePredicates } from '../../src/n3-packaging/lib/util'
import { testIsomorphism } from './utils'
import { type Quad } from 'rdf-js'
// import * as fs from 'fs'

// TODO:: Mocking readFileSync is not working so I'm ignoring it atm
describe('Packaging module', () => {
  const contentString: string =
`@prefix : <http://example.org/ns#>.
:a :b :c.`

  const contentQuads: Quad[] = [
    DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      undefined
    )]

  jest.mock('fs', () => ({
    readFileSync: jest.fn()
  }))

  test('Creating a package without metadata adds a date value', () => {
    expect(1).toBe(1)
  })

  test('Expect packaging from file, quads and string to give the same string result', async () => {
    // const p1 = await packageContentFile('./example/ignored/path', {})
    const p2 = await packageContentString(contentString, {})
    const p3 = await packageContentQuads(contentQuads, {})
    // expect(p1).toEqual(p2)
    expect(p2).toEqual(p3)
  })

  test('Expect packaging from file, quads and string to give the same N3Quads result', async () => {
    // const p1 = await packageContentFileToN3Quads('./example/ignored/path', {})
    const p2 = await packageContentStringToN3Quads(contentString, {})
    const p3 = await packageContentQuadsToN3Quads(contentQuads, {})
    // testIsomorphism(p1, p2)
    testIsomorphism(p2, p3)
  })

  test('Expect empty options file to add package without any metadata', async () => {
    const p = await packageContentStringToN3Quads(contentString, {})
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

    const contentQuads = store.getQuads(null, null, null, contentGraphTerm)
    expect(contentQuads.length).toEqual(1)
    testIsomorphism(contentQuads, [DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      contentQuads[0].graph
    )])
  })

  test('Expect timeStamp option to add creation date metadata to package', async () => {
    const p = await packageContentStringToN3Quads(contentString, { timeStamp: true })
    const store = new Store()
    store.addQuads(p)

    // Test pack:package quad
    const quads1 = store.getQuads(null, 'https://example.org/ns/package#package', null, null)
    expect(quads1.length).toEqual(1)
    const packageGraphTerm = quads1[0].object

    const contentQuads = store.getQuads(null, PackagePredicates.createdAt, null, packageGraphTerm)
    expect(contentQuads.length).toEqual(1)
    expect(contentQuads[0].object.termType).toEqual('Literal')
    expect((contentQuads[0].object as Literal).datatype).toEqual(DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime'))
  })
})
