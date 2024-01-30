import { DataFactory, Quad } from "n3";
import { n3toQuadArray } from "./createSignedPackage"

const pack = "https://example.org/ns/package#"

export function unPackagePackageString(packageString: string) : Quad[]{ 
    let packageN3Quads = n3toQuadArray(packageString);
    return unPackage(packageN3Quads);
}

export function unPackagePackageN3Quads(packageN3Quads: Quad[]) : Quad[] { 
    return unPackage(packageN3Quads);
}

function unPackage(quads: Quad[]) : Quad[] {
    let contentGraphTerms = new Set();
    for (let quad of quads) {
        if (quad.predicate.value === pack+"content") {
            contentGraphTerms.add(quad.object)
        }
    }
    
    return quads.filter(quad => {
        contentGraphTerms.has(quad.graph) && DataFactory.quad(quad.subject, quad.predicate, quad.object, undefined)
    })
}
