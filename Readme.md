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


# Example package


## N3


## Trig
```
@prefix : <https://example.org/ns/example#>.
@prefix pack: <https://example.org/ns/package#>.
@prefix sign: <https://example.org/ns/signature#>.
@prefix pol: <https://example.org/ns/policy#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
@prefix lingua: <http://www.w3.org/2000/10/swap/lingua#>.
@prefix var: <http://www.w3.org/2000/10/swap/var#>.

[] pack:package _:pack1 .

_:pack1 {
    [] pack:content _:content1 ;
        pack:origin :Endpoint ;
        pack:createdAt "2024-01-08T17:08:52.165Z"^^xsd:dateTime ;
        pack:hasContentSignature [
            a sign:Signature ;
            sign:issuer :Alice ;
            sign:created "2024-01-08T17:08:52.166Z"^^xsd:dateTime ;
            sign:proofValue "sSJ0xHT7yH2MeYjI6I7fVy+PRfh/EDJkTEOhbCA2BYcd+GBJRD1BQV1rwVe69cNPHhtvGKbITIf7TBlbpkE6YANMNNS2aSQMw8i6TLTXa16zhukp+V1nLYKE/51rt/Us"
        ] .
}

_:content1 {
    :Bob vcard:bday "2000-01-01T09:00:00.000Z"^^xsd:dateTime .
}

```