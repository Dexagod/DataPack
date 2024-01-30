import {describe, expect, test} from '@jest/globals';
import { 
    packageContentFile, 
    packageContentFileToN3Quads, 
    packageContentQuads,
    packageContentQuadsToN3Quads, 
    packageContentString, 
    packageContentStringToN3Quads 
} from '../lib/packaging';

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});