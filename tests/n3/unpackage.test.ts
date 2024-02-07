/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-rdf' // This is not working correctly somehow
import { describe, test } from '@jest/globals'
import { DataFactory, type Quad } from 'n3'
import { testIsomorphism } from '../util/utils'
import { packageContent } from '../../src/n3'
import { unpackageAll, unpackageOne } from '../../src/n3/unpackage'

describe('UnPackaging module', () => {
  const contentQuads: Quad[] = [
    DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      undefined
    )]

  test('packaging and unpackaging leads to the same value', async () => {
    const p1 = await packageContent(contentQuads, {})
    const quads = unpackageAll(p1)
    testIsomorphism(contentQuads, quads)
  })

  test('packaging and unpackaging with metadata leads to the same value', async () => {
    const p1 = await packageContent(contentQuads, {
      actor: 'https://example.org/person#actor',
      timeStamp: true,
      origin: 'https://example.org/dataspaces#origin',
      policy: {
        duration: 'P3M',
        purpose: 'https://example.org/purposes#Research',
        issuer: 'https://example.org/person#actor'
      },
      sign: {
        value: 'ABCDEFGH',
        issuer: 'https://example.org/person#actor'
      }
    })
    const quads = unpackageAll(p1)
    testIsomorphism(contentQuads, quads)
  })

  test('packaging and unpackaging nested packages leads to the same value', async () => {
    const p1 = await packageContent(contentQuads, {})
    const p2 = await packageContent(p1, {})
    const p3 = await packageContent(p2, {})
    const quads = unpackageAll(p3)
    testIsomorphism(contentQuads, quads)
  })

  test('packaging and unpackaging nedsted packages with metadata leads to the same value', async () => {
    const p1 = await packageContent(contentQuads, {
      actor: 'https://example.org/person#actor',
      timeStamp: true,
      origin: 'https://example.org/dataspaces#origin',
      policy: {
        duration: 'P3M',
        purpose: 'https://example.org/purposes#Research',
        issuer: 'https://example.org/person#actor'
      },
      sign: {
        value: 'ABCDEFGH',
        issuer: 'https://example.org/person#actor'
      }
    })

    const p2 = await packageContent(p1, {
      actor: 'https://example.org/person#actor',
      timeStamp: true,
      origin: 'https://example.org/dataspaces#origin',
      policy: {
        duration: 'P3M',
        purpose: 'https://example.org/purposes#Research',
        issuer: 'https://example.org/person#actor'
      },
      sign: {
        value: 'ABCDEFGH',
        issuer: 'https://example.org/person#actor'
      }
    })

    const p3 = await packageContent(p2, {
      actor: 'https://example.org/person#actor',
      timeStamp: true,
      origin: 'https://example.org/dataspaces#origin',
      policy: {
        duration: 'P3M',
        purpose: 'https://example.org/purposes#Research',
        issuer: 'https://example.org/person#actor'
      },
      sign: {
        value: 'ABCDEFGH',
        issuer: 'https://example.org/person#actor'
      }
    })

    const quads = unpackageAll(p3)
    testIsomorphism(contentQuads, quads)
  })

  test('unpackaging one package should remove the top package', async () => {
    const p1 = await packageContent(contentQuads, {})
    const quads = unpackageOne(p1)
    testIsomorphism(contentQuads, quads)
  })
  test('unpackaging one package should remove the top package when nested', async () => {
    const p1 = await packageContent(contentQuads, {})
    const p2 = await packageContent(p1, {})
    const quads = unpackageOne(p2)
    testIsomorphism(p1, quads)
  })

  test('unpackaging one package should remove all packages in the default graph top package', async () => {
    const p1 = await packageContent(contentQuads, { origin: 'origin1' })
    const p2 = await packageContent(contentQuads, { origin: 'origin2' })
    const p3 = await packageContent(contentQuads, { origin: 'origin3' })
    const p4 = await packageContent(p3, {})
    const combinedPackages = p1.concat(p2).concat(p4)

    const quads = unpackageOne(combinedPackages)
    const verify = (await packageContent(contentQuads, { origin: 'origin3' })).concat(contentQuads).concat(contentQuads)
    testIsomorphism(verify, quads)
  })
})
