import { getChainObject } from "../Blockchain/data.js";
import { addJSObject, retrieveJSObject } from "../IPFS/Ipfs.js";
import { CID } from 'multiformats/cid'
export async function setKeyTransaction(cid, transaction, vehicleID) {
    obj = await retrieveJSObject(CID.parse(cid))
    const transactionMap = new Map(Object.entries(obj))
    transactionMap.set(vehicleID, transaction)
    return transactionMap
}

export const createBlockData = async (transaction, vehicleID) => {
    var chain = await getChainObject()
    var lastBlock = await retrieveJSObject(CID.parse(chain.lastBlock))
    let transactionMap
    if (lastBlock.isGenesisBlock) {
        transactionMap = new Map()
        transactionMap.set(vehicleID.toString(), transaction)
    } else {
        transactionMap = setKeyTransaction(lastBlock, transaction, vehicleID.toString())
    }
    transactionMap = Object.fromEntries(transactionMap)
    var transactionHash = await addJSObject(transactionMap)
    return transactionHash.toString()
}
