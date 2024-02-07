/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type Quad } from 'rdf-js'
import 'jest-rdf'

export function testIsomorphism (expected: Quad[], outcome: Quad[]): void {
  expect(outcome).toBeRdfIsomorphic(expected)
}
