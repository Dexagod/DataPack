# DataPack
DataPack provides a method to describe subgraphs with RDF metadata.

## Usage

**Creating a Package**
```js
import {
    packageContentFile,               // file         ->      package as N3 string
    packageContentFileToN3Quads,      // file         ->      package as N3 quads
    packageContentString,             // N3 string    ->      package as N3 string
    packageContentStringToN3Quads,    // N3 string    ->      package as N3 quads
    packageContentQuads,              // N3 quads     ->      package as N3 string
    packageContentQuadsToN3Quads      // N3 quads     ->      package as N3 quads
} from './install/location'

const N3ContentString = 
`@prefix : <http://example.org/ns#>.
:Bob :knows :Alice.`

// Set package metadata options
let options = {}

// Create the package
const packageN3String = packageContentString(N3ContentString, options);
```

**Signing a package**
```js
import { 
    generateKeyPair,
    signN3PackageQuads, 
    signN3PackageString 
} from './install/location'

// First we need a key to sign the content with
const keyPair = generateKeyPair();

// This will nest the package in another package containing the content signature
const issuer = "http://example.org/people#person1"
const packageWithSignature = signN3PackageString(packageN3String, issuer, keyPair.privateKey)
```

**Validate signatures**
```js
import { 
    validateN3PackageSignatures,            // This function verifies a signature over a package
    validateContentSignature                // This function verifies a signature over a hash
} from './install/location'

// Now we can validate the package signatures
// The following function validates all signatures found in a package.
const packageSignaturesAreValid = validateN3PackageSignatures(packageWithSignature, keyPair.publicKey);
```

**Unpackaging the packages**
```js
import {
  unpackageN3PackageString,
  unpackageN3PackageQuads
} from './install/location'

// Now that we have verified the signatures of the package, we can remove the packaging metadata to retrieve our original data.
// Note that additional constraints for validating data can be implemented, such as matching specific metadata, checking policy constraints, etc ...

const data = unpackageN3PackageString(packageWithSignature);
// data = `<http://example.org/ns#Bob> <http://example.org/ns#knows> <http://example.org/ns#Alice> .
```


## Provenance
Todo

## Policies
Todo

## Signatures
The generation, serialization and deserialization of crypto keys in this library (for now) makes use of the Elliptic Curve Digital Signature Algorithm (ECDSA) with a [P-384 elliptic curve](https://en.wikipedia.org/wiki/P-384).
The signatures are done using a SHA 512 hash algorithm over the RDF dataset canonicalization using [rdfjs-c14n](https://www.npmjs.com/package/rdfjs-c14n).
To canonicalize N3, we serialize it to RDF 1.1 quads, over which we then execute the canonicalization algorithm.

## Package Modeling

### N3

#### Example

```
@prefix : <https://example.org/ns/example#>.
@prefix pack: <https://example.org/ns/package#>.
@prefix sign: <https://example.org/ns/signature#>.
@prefix pol: <https://example.org/ns/policy#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix vcard: <http://www.w3.org/2006/vcard/ns#>.

[] pack:package {
    [] pack:content {
        :Bob vcard:bday "2000-01-01T09:00:00.000Z"^^xsd:dateTime .
    } ;
        pack:origin :Endpoint ;
        pack:createdAt "2024-01-08T17:08:52.165Z"^^xsd:dateTime ;
        pack:hasContentSignature [
            a sign:Signature ;
            sign:issuer :Alice ;
            sign:created "2024-01-08T17:08:52.166Z"^^xsd:dateTime ;
            sign:proofValue "sSJ0xHT7yH2MeYjI6I7fVy+PRfh/EDJkTEOhbCA2BYcd+GBJRD1BQV1rwVe69cNPHhtvGKbITIf7TBlbpkE6YANMNNS2aSQMw8i6TLTXa16zhukp+V1nLYKE/51rt/Us"
    ] .
} .
```


### RDF 1.1 
This is not yet available

# Todo

- [ ] Look into a supporting a generic set of  algorithms for crypto key generation, serialization and deserialization
- [ ] Look into a supporting a generic set of  algorithms for signatures
- [ ] Have concrete ontologies for crypto key storage
- [ ] Have concrete ontologies for provenance data modeling
- [ ] Have concrete ontologies for signature data modeling
- [ ] Have concrete ontologies for policy data modeling

- [ ] Have a separate implementation using RDF 1.1 instead of N3
