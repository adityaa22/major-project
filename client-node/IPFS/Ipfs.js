import { dagJson } from '@helia/dag-json'
import node from '../Node/Node.js'

const d = dagJson(node)

const addJSObject = (async (object) => {
    const cid = await d.add(object)
    return cid
})

const retrieveJSObject = (async (cid) => {
    const object = await d.get(cid)
    return object
})

export { addJSObject, retrieveJSObject }