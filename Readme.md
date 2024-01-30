# DataPack
DataPack provides a method to describe subgraphs with RDF metadata.


# Modeling

## N3-packaging

### Example

```
@prefix : <https://example.org/ns/example#>.
@prefix pack: <https://example.org/ns/package#>.
@prefix sign: <https://example.org/ns/signature#>.
@prefix pol: <https://example.org/ns/policy#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix vcard: <://www.w3.org/2006/vcard/ns#>.

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
            sign:proofValue "sSJ0xHT7yH2MeYjI6I7fVy+PRfh/EDJkTEOhbCA2BYcd+GBJRD1BQV1rwVe69cNPHhtvGKbITIf7TBlbpkE6YANMNNS2aSQMw8i6TLTXa16zhukp+V1nLYKE/51rt/Us".
    ] .
} .
```