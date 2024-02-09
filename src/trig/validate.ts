import { type TrigPackage } from './trigUtil'
import { type KeyMap, validateSignatures } from '../pack/validate'

export async function validatePackageSignatures (content: TrigPackage, keyMap: KeyMap): Promise<boolean> {
  return await validateSignatures(content, keyMap)
}
