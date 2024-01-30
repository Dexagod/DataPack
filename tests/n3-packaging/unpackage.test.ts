/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-rdf' // This is not working correctly somehow
import { describe, expect, test } from '@jest/globals'
import { DataFactory, type Quad } from 'n3'
import { packageContentQuadsToN3Quads } from '../../src/n3-packaging/lib/package'
import { unPackageFromN3Quads } from '../../src/n3-packaging/lib/unpackage'
import { testIsomorphism } from './utils'

describe('UnPackaging module', () => {
  const contentQuads: Quad[] = [
    DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      undefined
    )]

  test('packaging and unpackaging leads to the same value', async () => {
    const p1 = await packageContentQuadsToN3Quads(contentQuads, {})
    const quads = unPackageFromN3Quads(p1)
    testIsomorphism(contentQuads, quads)
  })

  test('packaging and unpackaging with metadata leads to the same value', async () => {
    const p1 = await packageContentQuadsToN3Quads(contentQuads, {
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
    const quads = unPackageFromN3Quads(p1)
    testIsomorphism(contentQuads, quads)
  })

  test('packaging and unpackaging nested packages leads to the same value', async () => {
    const p1 = await packageContentQuadsToN3Quads(contentQuads, {})
    const p2 = await packageContentQuadsToN3Quads(p1, {})
    const p3 = await packageContentQuadsToN3Quads(p2, {})
    const quads = unPackageFromN3Quads(p3)
    testIsomorphism(contentQuads, quads)
  })

  test('packaging and unpackaging nedsted packages with metadata leads to the same value', async () => {
    const p1 = await packageContentQuadsToN3Quads(contentQuads, {
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

    const p2 = await packageContentQuadsToN3Quads(p1, {
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

    const p3 = await packageContentQuadsToN3Quads(p2, {
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

    const quads = unPackageFromN3Quads(p3)
    testIsomorphism(contentQuads, quads)
  })
})
