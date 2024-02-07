/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-rdf' // This is not working correctly somehow
import { describe } from '@jest/globals'
import { DataFactory } from 'n3'
import type * as rdf from 'rdf-js'
import { generateKeyPair, packageContent, signContent, verifySignatures } from '../../src/n3'
import { unpackageAll, unpackageOne } from '../../src/n3/unpackage'
import { testIsomorphism } from '../util/utils'
import { type KeyMap } from '../../src/n3/validate'

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

  let keyMap: KeyMap
  let falseKeyMap: KeyMap

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
  })

  beforeAll(async () => {
    keyPair1 = await generateKeyPair()
    keyPair2 = await generateKeyPair()

    keyMap = new Map([[issuer1, keyPair1.publicKey], [issuer2, keyPair2.publicKey]])
    falseKeyMap = new Map([[issuer1, keyPair2.publicKey], [issuer2, keyPair2.publicKey]])
  })

  test('Expect RDF triples to be signeable', async () => {
    const p = await signContent(contentQuads, issuer1, keyPair1.privateKey)
    expect(p.length).toBeGreaterThan(0)
    expect(unpackageAll(p)).toEqual(contentQuads)
  })

  test('Expect RDF package to be signeable', async () => {
    const p = await packageContent(contentQuads, {})
    const sp = await signContent(p, issuer1, keyPair1.privateKey)
    expect(sp.length).toBeGreaterThan(0)
    testIsomorphism(unpackageOne(sp), p)
  })

  test('Expect a signature to be verifiable', async () => {
    const p = await signContent(contentQuads, issuer1, keyPair1.privateKey)
    const v = await verifySignatures(p, keyMap)
    expect(v).toBe(true)
  })

  test('Expect a package signature to be verifiable', async () => {
    const p = await packageContent(contentQuads, {})
    const sp = await signContent(p, issuer1, keyPair1.privateKey)
    const v = await verifySignatures(sp, keyMap) // this
    expect(v).toBe(true)
  })

  test('Expect a nested package signature to be verifiable', async () => {
    const p = await packageContent(contentQuads, {})
    const sp = await signContent(p, issuer1, keyPair1.privateKey)
    const psp = await packageContent(sp, {})
    const verification = await verifySignatures(psp, keyMap) // this
    expect(verification).toBe(true)
  })

  test('Expect verification of a package without signatures to return true', async () => {
    const p = await packageContent(contentQuads, {})
    const verification = await verifySignatures(p, keyMap)
    expect(verification).toBe(true)
  })

  test('Expect nested signatures to return true', async () => {
    const s = await signContent(contentQuads, issuer1, keyPair1.privateKey)
    const ss = await signContent(s, issuer1, keyPair1.privateKey)
    const sss = await signContent(ss, issuer1, keyPair1.privateKey)
    const verification = await verifySignatures(sss, keyMap) // this
    expect(verification).toBe(true)
  })

  test('Expect verification with an incorrect key to return false', async () => {
    const s = await signContent(contentQuads, issuer1, keyPair1.privateKey)
    const verification = await verifySignatures(s, falseKeyMap)
    expect(verification).toBe(false)
  })

  test('Expect verification of nested packages with incorrect and correct keys to return false', async () => {
    const s = await signContent(contentQuads, issuer1, keyPair1.privateKey)
    const s2 = await signContent(s, issuer2, keyPair2.privateKey)
    const verification = await verifySignatures(s2, falseKeyMap)
    expect(verification).toBe(false)
  })
})
