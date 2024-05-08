import { dagJson } from '@helia/dag-json'
import bootstrapNode from '../Node/BootstrapNode.js'

const d = dagJson(bootstrapNode)

const addJSObject = (async (object) => {
    console.log("Adding from peer: ", bootstrapNode.libp2p.peerId)
    const cid = await d.add(object)
    return cid
})

const retrieveJSObject = (async (cid) => {
    console.log("Retrieving from peer: ", bootstrapNode.libp2p.peerId)
    const object = await d.get(cid)
    return object
})

export { addJSObject, retrieveJSObject }
