import { dagJson } from '@helia/dag-json'
import node from '../Node/Node.js'

const d = dagJson(node)

const addJSObject = (async (object) => {
    console.log("Adding from peer: ", node.libp2p.peerId)
    const cid = await d.add(object)
    return cid
})

const retrieveJSObject = (async (cid) => {
    console.log("Retrieving from peer: ", node.libp2p.peerId)
    const object = await d.get(cid)
    return object
})

export { addJSObject, retrieveJSObject }