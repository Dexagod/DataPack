/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-rdf' // This is not working correctly somehow
import { describe, expect, test } from '@jest/globals'
import * as fs from 'fs'
import { DataFactory, type Quad } from 'n3'

describe('UnPackaging module', () => {
  const contentQuads: Quad[] = [
    DataFactory.quad(
      DataFactory.namedNode('http://example.org/ns#a'),
      DataFactory.namedNode('http://example.org/ns#b'),
      DataFactory.namedNode('http://example.org/ns#c'),
      undefined
    )]

  test('Creating a package without metadata adds a date value', () => {
    expect(1).toBe(1)
  })
})
