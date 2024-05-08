import { addJSObject, retrieveJSObject } from "../IPFS/Ipfs.js";
import { CID } from 'multiformats/cid'
class Block {
    constructor() {

    }
    initGenesis(chainId) {
        this.chainId = chainId
        this.isGenesisBlock = true
        return this
    }
    init(BlockData, previousHash, chainId) {
        this.BlockData = BlockData;
        this.previousHash = previousHash;
        this.chainId = chainId
        this.isGenesisBlock = false
        return this
    }
}


class Blockchain {
    constructor() {

    }
    async initCopy(object) {
        this.chainId = object.chainId
        this.GenesisBlock = object.GenesisBlock;
        this.lastBlock = object.lastBlock;
        return this
    }
    async init() {
        this.chainId = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
        this.GenesisBlock = (await addJSObject(new Block().initGenesis(this.chainId))).toString();
        this.lastBlock = this.GenesisBlock;
        console.log("New Chain created with chainID: ", this.chainId)
        return this
    }
    async addBlock(transaction, nodeId) {
        let BlockData = {
            data: transaction,
            miner: nodeId,
        };
        let block = new Block().init(BlockData, this.lastBlock, this.chainId);
        const cid = await addJSObject(block)
        this.lastBlock = cid.toString()
    }
    test() {
        console.log("This is a test function")
    }
    async retrieveBlock(blockId) {
        let block = await retrieveJSObject(CID.parse(blockId))
        return block
    }
}

export default Blockchain 