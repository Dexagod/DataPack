const pack = 'https://example.org/ns/package#'

export enum PackagePredicates {
  package = pack + 'package',
  content = pack + 'content',
  createdAt = pack + 'createdAt',
  actor = pack + 'actor',
  origin = pack + 'origin',
  hasContentPolicy = pack + 'hasContentPolicy',
  hasContentSignature = pack + 'hasContentSignature',
}
