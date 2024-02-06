// REASONING???

// EASY REQUIREMENTS FOR PACKAGE => Filtered result

export { packageContent } from './package'

export {
  unpackageOne as unpackContent,
  unpackageAll as flattenContent
} from './unpackage'

export {
  signContent
} from './sign'

export {
  validatePackageSignatures as verifySignatures
} from './validate'

export {
  serializeN3PackageToN3String as serializePackage,
  parseN3StringToN3Package as parsePackageString
} from './n3util'

export {
  generateKeyPair
} from '../sign/util'

// MINIMAL OPTIONS

// Conversion

// Package Quads => N3 String                       -     serializePackage
// N3 String => Package Quads                       -     parsePackageString

// Packaging

// RDF Quads => Package Quads                       -     packageContent
// Package Quads => Package Quads                   -     packageContent

// Unpackaging

// Package Quads => RDF Quads | Package Quads       -     unpackageOne
// Package Quads => RDF Quads                       -     unpackageAll

// Signatures

// RDF Quads => Package Quads                       -     signContent
// Package Quads => Package Quads                   -     signContent

// Validation

// Package Quads => boolean                         -     verifySignatures

// REASONING???

// EASY REQUIREMENTS FOR PACKAGE => Filtered result -     
