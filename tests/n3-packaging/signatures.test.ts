/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-rdf' // This is not working correctly somehow
import { describe, test } from '@jest/globals'
import { DataFactory } from 'n3'
import { packageContentQuadsToN3Quads } from '../../src/n3-packaging/lib/package'
import { createContentSignatureFromN3String, createContentSignatureFromQuads, generateKeyPair, signContentQuads } from '../../src/n3-packaging/lib/sign'
import type * as rdf from 'rdf-js'
import { verifyDataGraph } from '../../src/n3-packaging/lib/validate'

describe('UnPackaging module', () => {
  const contentQuads: rdf.Quad[] = [
    DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      undefined
    )]

  const issuer1 = 'https://people.org/Alice'
  const issuer2 = 'https://people.org/Bob'

  let keyPair1: CryptoKeyPair
  let keyPair2: CryptoKeyPair
  let packageQuads1: rdf.Quad[]
  let packageQuads2: rdf.Quad[]

  beforeAll(async () => {
    packageQuads1 = await packageContentQuadsToN3Quads(contentQuads, {
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

    packageQuads2 = await packageContentQuadsToN3Quads(contentQuads, {
      actor: 'https://example.org/person#actor2',
      timeStamp: true,
      origin: 'https://example.org/dataspaces#origin2',
      policy: {
        duration: 'P3M',
        purpose: 'https://example.org/purposes#Research2',
        issuer: 'https://example.org/person#actor2'
      },
      sign: {
        value: 'ABCDEFGH2',
        issuer: 'https://example.org/person#actor2'
      }
    })

    keyPair1 = await generateKeyPair()
    keyPair2 = await generateKeyPair()
  })

  test('Signatures can be verified', async () => {
    const signatureString = await createContentSignatureFromQuads(packageQuads1, keyPair1.privateKey)
    console.log(signatureString)
    const verificationResult = await verifyDataGraph(packageQuads1, signatureString, keyPair1.publicKey)
    console.log(verificationResult)
    expect(verificationResult).toBeTruthy()
  })

  test('Verifying with an incorrect key should be false', async () => {
    const signatureString = await signContentQuads(packageQuads1, issuer1, keyPair1.privateKey)
    const verificationResult = await verifyDataGraph(packageQuads1, signatureString, keyPair2.publicKey) // other public key
    expect(verificationResult).toBeFalsy()
  })
})
