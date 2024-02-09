import { Parser, Writer } from 'n3'
import type * as rdf from 'rdf-js'

export type TrigString = string
export type TrigPackage = rdf.Quad[]
export type TrigPackageString = TrigString

export async function serializeTrigPackageToTrigString (content: TrigPackage): Promise<TrigString> {
  return new Writer({ format: 'application/trig' }).quadsToString(content)
}
export function parseTrigStringToTrigPackage (content: TrigString): TrigPackage {
  return new Parser({ format: 'application/trig' }).parse(content)
}
