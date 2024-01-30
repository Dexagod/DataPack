/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type Quad } from 'n3'
import 'jest-rdf'

export function testIsomorphism (quads1: Quad[], quads2: Quad[]): void {
  expect(quads1).toBeRdfIsomorphic(quads2)
}
