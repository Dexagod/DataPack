import { DataFactory } from 'n3'
import type { BlankNode } from 'n3'
import { PackagePredicates, SignaturePredicates, signatureType } from '../util/util'
import type * as rdf from 'rdf-js'
import { type N3Package } from './n3util'

const DF = DataFactory
// const policy = 'https://example.org/ns/policy#'
const xsd = 'http://www.w3.org/2001/XMLSchema#'
const odrl = 'http://www.w3.org/ns/odrl/2/'
const dcterms = 'http://purl.org/dc/terms/'

interface PackageOptions {
  actor?: string // Actor responsible for the packaging
  origin?: string // Origin of the packaged data
  documentUri?: string // URI of the document -- TODO:: remove this and make inverse relation
  contentType?: string // content type of the content
  policy?: { // Policies of the content
    duration?: string // Duration for which the receiving actor can use the data, takes a XSD duration
    purpose?: string // Purpose of the packaging - Usage Policy, takes a URL input of the purpose
    issuer: string // Issuer of the signature
  }
  sign?: { // Signature of the content
    value: string // Signature value
    issuer: string // Issuer of the signature
  }
  timeStamp?: boolean
  quads?: rdf.Quad[] // Replaces the blankNode with name value "package" for the package blank node
}

export async function packageContent (content: rdf.Quad[] | N3Package, options: PackageOptions): Promise<N3Package> {
  return await processContent(content, options)
}

async function processContent (quads: rdf.Quad[], options: PackageOptions): Promise<N3Package> {
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

  return packageQuads as N3Package
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
