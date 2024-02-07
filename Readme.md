# RDF-Package
This library enables the packaging of RDF graphs with provenance, usage control, signature and other custom RDF metadata.

## Installation

This process depends on Node v21 because of a dependency on the crypto module. 
The inclusion of jest-rdf is because of a bug that fails compilation. This will be removed in the future.


```bash
npm install jest-rdf SolidLabResearch/RDF-Package
```

## Usage

```js
const triples = [ df.triple(
    df.namedNode('http://example.org/ns#a'),
    df.namedNode('http://example.org/ns#b'),
    df.namedNode('http://example.org/ns#c')
), df.triple(
    df.namedNode('http://example.org/ns#x'),
    df.namedNode('http://example.org/ns#y'),
    df.namedNode('http://example.org/ns#z')
)]

const personURI = "http://people.org/#me"
const dataspaceURI = "http://dataspace.org/#me"

// Packaging

const packagedContent = await pack.packageContent(triples, {
    actor: personURI,
    origin: dataspaceURI
})

console.log(`
###Packaged##

${await pack.serializePackage(packagedContent)}
`)

// Singing

const keyPair = await pack.generateKeyPair();

const signaturePackage = await pack.signContent(
    packagedContent,
    personURI,
    keyPair.privateKey
)

console.log(`
###Signed###

${await pack.serializePackage(signaturePackage)}
`)

// Verifying

const keyMap = new Map([[personURI, keyPair.publicKey]])
const verified = await pack.verifySignatures(signaturePackage, keyMap)

console.log(`    
###Verified###

${verified}
`)

// Unpackaging

const originalContent = await pack.unpackageContent(signaturePackage)

console.log(`
###Unpackaged###

${await pack.serializePackage(originalContent)}
`)
```
