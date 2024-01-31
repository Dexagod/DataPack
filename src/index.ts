export {
  signContentQuads as signN3PackageQuads,
  signContentString as signN3PackageString
} from './n3-packaging/lib/sign'

export {
  validateSignatures as tagValidatedPackageSignaturesInStore,
  validatePackageSignatures as validateN3PackageSignatures,
  verifyDataGraph as validateContentSignature
} from './n3-packaging/lib/validate'

export {
  packageContentFile,
  packageContentFileToN3Quads,
  packageContentString,
  packageContentStringToN3Quads,
  packageContentQuads,
  packageContentQuadsToN3Quads
} from './n3-packaging/lib/package'

export {
  unPackageFromString as unpackageN3PackageString,
  unPackageFromN3Quads as unpackageN3PackageQuads
} from './n3-packaging/lib/unpackage'
