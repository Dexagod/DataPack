import { type N3Package } from './n3util'
import { type KeyMap, validateSignatures } from '../pack/validate'

export async function validatePackageSignatures (content: N3Package, keyMap: KeyMap): Promise<boolean> {
  return await validateSignatures(content, keyMap)
}
