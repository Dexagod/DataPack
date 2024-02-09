import { DataFactory } from 'n3'
import type { BlankNode } from 'n3'
import { type PackageOptions, PackagePredicates, SignaturePredicates, signatureType } from '../util/util'
import type * as rdf from 'rdf-js'

const DF = DataFactory
// const policy = 'https://example.org/ns/policy#'
const xsd = 'http://www.w3.org/2001/XMLSchema#'
const odrl = 'http://www.w3.org/ns/odrl/2/'
const dcterms = 'http://purl.org/dc/terms/'

export async function packageContent<T> (quads: rdf.Quad[], options: PackageOptions): Promise<T> {
  const packageGraph = DF.blankNode()
  const packageBlankNode = DF.blankNode()
  const contentGraph = DF.blankNode()

  let packageQuads: rdf.Quad[] = [
    DF.quad(DF.blankNode(), DF.namedNode(PackagePredicates.package), packageGraph, DF.defaultGraph()),
    DF.quad(packageBlankNode, DF.namedNode(PackagePredicates.content), contentGraph, packageGraph)
  ]

  // Adding content quads, by changing the default grapg for the content graph
  packageQuads = packageQuads.concat(
    quads.map(q =>
      q.graph.equals(DF.defaultGraph())
        ? DataFactory.quad(q.subject, q.predicate, q.object, contentGraph)
        : q
    )
  )

  packageQuads = packageQuads.concat(addProvenance(packageBlankNode, packageGraph, options))
  packageQuads = packageQuads.concat(addPolicy(packageBlankNode, packageGraph, options))
  packageQuads = packageQuads.concat(addSignature(packageBlankNode, packageGraph, options))
  packageQuads = packageQuads.concat(addCustomQuads(packageBlankNode, packageGraph, options))

  return packageQuads as T
}

function addProvenance (packageBlankNode: BlankNode, packageGraph: BlankNode, options: PackageOptions): rdf.Quad[] {
  const metadata: rdf.Quad[] = []
  if (options.actor) metadata.push(DF.quad(packageBlankNode, DF.namedNode(PackagePredicates.actor), DF.namedNode(options.actor), packageGraph))
  if (options.origin) metadata.push(DF.quad(packageBlankNode, DF.namedNode(PackagePredicates.origin), DF.namedNode(options.origin), packageGraph))
  if (options.timeStamp) metadata.push(DF.quad(packageBlankNode, DF.namedNode(PackagePredicates.createdAt), DF.literal(new Date().toISOString(), DF.namedNode(xsd + 'dateTime')), packageGraph))
  return metadata
}

function addPolicy (packageBlankNode: BlankNode, packageGraph: BlankNode, options: PackageOptions): rdf.Quad[] {
  let metadata: rdf.Quad[] = []

  if (!options.policy) return []

  const policyBlankNode = DF.blankNode()
  const permissionBlankNode = DF.blankNode()

  const constraintBlankNodes: BlankNode[] = []

  // Add duration constraint
  if (options.policy.duration) {
    const constraintBlankNode = DF.blankNode()
    metadata = metadata.concat([
      DF.quad(constraintBlankNode, DF.namedNode(odrl + 'leftOperand'), DF.namedNode(odrl + 'elapsedTime'), packageGraph),
      DF.quad(constraintBlankNode, DF.namedNode(odrl + 'operator'), DF.namedNode(odrl + 'eq'), packageGraph),
      DF.quad(constraintBlankNode, DF.namedNode(odrl + 'rightOperand'), DF.literal(options.policy.duration, DF.namedNode(xsd + 'duration')), packageGraph)
    ])
    constraintBlankNodes.push(constraintBlankNode)
  }

  // add purpose constraint
  if (options.policy.purpose) {
    const constraintBlankNode = DF.blankNode()
    metadata = metadata.concat([
      DF.quad(constraintBlankNode, DF.namedNode(odrl + 'leftOperand'), DF.namedNode('https://w3id.org/oac#Purpose'), packageGraph),
      DF.quad(constraintBlankNode, DF.namedNode(odrl + 'operator'), DF.namedNode(odrl + 'eq'), packageGraph),
      DF.quad(constraintBlankNode, DF.namedNode(odrl + 'rightOperand'), DF.literal(options.policy.purpose), packageGraph)
    ])
    constraintBlankNodes.push(constraintBlankNode)
  }

  metadata = metadata.concat([
    DF.quad(packageBlankNode, DF.namedNode(PackagePredicates.hasContentPolicy), policyBlankNode, packageGraph),

    DF.quad(policyBlankNode, DF.namedNode(dcterms + 'creator'), DF.literal(options.policy.issuer), packageGraph),
    DF.quad(policyBlankNode, DF.namedNode(dcterms + 'issued'), DF.literal(new Date().toISOString(), DF.namedNode(xsd + 'dateTime')), packageGraph),
    DF.quad(policyBlankNode, DF.namedNode(dcterms + 'permission'), permissionBlankNode, packageGraph),

    DF.quad(permissionBlankNode, DF.namedNode(odrl + 'action'), DF.namedNode(odrl + 'use'), packageGraph)
  ])
  for (const constraintBlankNode of constraintBlankNodes) {
    metadata = metadata.concat([
      DF.quad(permissionBlankNode, DF.namedNode(odrl + 'constraint'), constraintBlankNode, packageGraph)
    ])
  }
  return metadata
}

function addSignature (packageBlankNode: BlankNode, packageGraph: BlankNode, options: PackageOptions): rdf.Quad[] {
  let metadata: rdf.Quad[] = []

  const signatureBlankNode = DF.blankNode()
  if (options.sign) {
    metadata = metadata.concat([
      DF.quad(packageBlankNode, DF.namedNode(PackagePredicates.hasContentSignature), signatureBlankNode, packageGraph),
      DF.quad(signatureBlankNode, DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), DF.namedNode(signatureType), packageGraph),
      DF.quad(signatureBlankNode, DF.namedNode(SignaturePredicates.issuer), DF.namedNode(options.sign.issuer), packageGraph),
      DF.quad(signatureBlankNode, DF.namedNode(SignaturePredicates.created), DF.literal(new Date().toISOString(), DF.namedNode(xsd + 'dateTime')), packageGraph),
      DF.quad(signatureBlankNode, DF.namedNode(SignaturePredicates.proofValue), DF.literal(options.sign.value), packageGraph)
    ])
  }
  return metadata
}

/**
 * note: This function interchanges a quad with a SUBJECT BLANK NODE value of "package" to the package blank node
 */
function addCustomQuads (packageBlankNode: BlankNode, packageGraph: BlankNode, options: PackageOptions): rdf.Quad[] {
  let metadata: rdf.Quad[] = []

  if (options.quads) {
    metadata = options.quads.map(q => DF.quad(
      q.subject.equals(DF.blankNode('package')) ? packageBlankNode : q.subject,
      q.predicate,
      q.object,
      packageGraph
    ))
  }
  return metadata
}
