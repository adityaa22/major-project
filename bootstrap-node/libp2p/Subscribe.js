import { publicKey } from "../crypto/crypto.js";
import { setKey } from "../crypto/data.js";
import { setChainObject, getChainObject } from "../Blockchain/data.js";
import { addJSObject, retrieveJSObject } from "../IPFS/Ipfs.js";
import bootstrapNode from "../Node/BootstrapNode.js";
import { CID } from 'multiformats/cid'
const Subscribe = () => {
    var pubKey = publicKey
    // subscribe topics
    bootstrapNode.libp2p.services.pubsub.subscribe('NEW_PEER')
    bootstrapNode.libp2p.services.pubsub.subscribe('UPDATE_CHAIN')
    bootstrapNode.libp2p.services.pubsub.subscribe('CPU_LOAD')
    bootstrapNode.libp2p.services.pubsub.subscribe(`PEER_${bootstrapNode.libp2p.peerId.toString()}_PK`)
    bootstrapNode.libp2p.services.pubsub.subscribe(`PEER_${bootstrapNode.libp2p.peerId.toString()}_PK_RES`)

    // subscription listener
    bootstrapNode.libp2p.services.pubsub.addEventListener('message', async (msg) => {
        const topic = msg.detail.topic;
        switch (topic) {
            case 'NEW_PEER':
                const peerId = new TextDecoder().decode(msg.detail.data)
                bootstrapNode.libp2p.services.pubsub.publish('PEER_ADDED', new TextEncoder().encode(peerId))
                const id = peerId.split('/')[6]
                console.log("Connected to peer, peerId: ", id)
                var chain = await getChainObject()
                const cid = await addJSObject(chain)
                console.log("Active peers list: ", bootstrapNode.libp2p.getPeers())
                var jsonData = {
                    peer: bootstrapNode.libp2p.peerId.toString(),
                    publicKey: pubKey
                }
                bootstrapNode.libp2p.services.pubsub.publish(`PEER_${id}_CHAIN`, new TextEncoder().encode(cid))
                bootstrapNode.libp2p.services.pubsub.publish(`PEER_${id}_PK`, new TextEncoder().encode(JSON.stringify(jsonData)))
                break;
            
            case `PEER_${bootstrapNode.libp2p.peerId.toString()}_PK`:
                
                var data = JSON.parse(new TextDecoder().decode(msg.detail.data))
                var peer = data.peer
                var publicKey = data.publicKey
                setKey(peer, publicKey)
                setKey(peer, publicKey)
                console.log('Stored Public Key for peer: ', peer)
                var jsonData = {
                    peer: bootstrapNode.libp2p.peerId.toString(),
                    publicKey: pubKey
                }
                bootstrapNode.libp2p.services.pubsub.publish(`PEER_${peer}_PK_RES`, new TextEncoder().encode(JSON.stringify(jsonData)))
                break;

            case `PEER_${bootstrapNode.libp2p.peerId.toString()}_PK_RES`:
                var data = JSON.parse(new TextDecoder().decode(msg.detail.data))
        
                var peer = data.peer
                var publicKey = data.publicKey
                setKey(peer, publicKey)
                console.log('Stored Public Key for peer: ', peer)
                break;
            
            case 'UPDATE_CHAIN':
                var chainData = new TextDecoder().decode(msg.detail.data)
                var chainCID = CID.parse(chainData)
                var object = await retrieveJSObject(chainCID)
                await setChainObject(object)
                console.log("Chain copy created")
                break;
        }
    })
}

export default Subscribe