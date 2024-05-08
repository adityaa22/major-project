import { getChainObject } from "../Blockchain/data.js"
import { addJSObject, retrieveJSObject } from "../IPFS/Ipfs.js"
import { privateKey } from "../crypto/crypto.js"
import { CID } from 'multiformats/cid'
import crypto from 'crypto'

export const createTransaction = async (infoObj) => {
    const cid = await addJSObject(infoObj)
    return cid
}

export const signTransaction = async (transaction) => {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(transaction);
    return sign.sign(privateKey, 'hex');
}

export const fetchAndVerifyTransactionDetails = async (transaction, OwnerID, vehicleID) => {
    let chain = await getChainObject()
    let lastBlock = await retrieveJSObject(CID.parse(chain.lastBlock))
    let obj = await retrieveJSObject(CID.parse(lastBlock.BlockData.data))
    console.log(obj)
    var transactionMap = new Map(Object.entries(obj))
    let transactionHash = await transactionMap.get(vehicleID.toString())
    let transactionDetails = await retrieveJSObject(CID.parse(transactionHash))
    if (transaction == transactionHash && vehicleID == transactionDetails.vehicleID && OwnerID == transactionDetails.OwnerID) return true
    return false
}
