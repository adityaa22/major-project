import node from "../Node/Node.js"
import { multiaddr } from '@multiformats/multiaddr'
import { CID } from 'multiformats/cid'
import os from 'os'
import { getChainObject, setChainObject } from "../Blockchain/data.js"
import { retrieveJSObject } from "../IPFS/Ipfs.js"
import { publicKey } from "../crypto/crypto.js"
import { getKey, setKey } from "../crypto/data.js"
import { validate } from "../transaction/validateTransaction.js"

const Subscribe = () => {
    // subscribe to topics
    var pubKey = publicKey
    node.libp2p.services.pubsub.subscribe('PEER_ADDED')
    node.libp2p.services.pubsub.subscribe('UPDATE_CHAIN')
    node.libp2p.services.pubsub.subscribe('BACKUP_NODE_APPROVE_TRANSACTION')
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_CHAIN`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_PK`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_PK_RES`)


    // listener for subscribed topics
    node.libp2p.services.pubsub.addEventListener('message', async (msg) => {
        const topic = msg.detail.topic;
        switch (topic) {
            case 'PEER_ADDED':
                var peerId = new TextDecoder().decode(msg.detail.data)
                const addrs = multiaddr(peerId);
                if (node.libp2p.getMultiaddrs()[1].toString() == peerId) {
                    return;
                }
                const id = peerId.split('/')[6]
                await node.libp2p.dial(addrs)
                var jsonData = {
                    peer: node.libp2p.peerId.toString(),
                    publicKey: pubKey
                }
                console.log(`Added a new peer (${id}), Current active peers: `, node.libp2p.getPeers())
                setTimeout(() => {
                    node.libp2p.services.pubsub.publish(`PEER_${id}_PK`, new TextEncoder().encode(JSON.stringify(jsonData)))
                }, 2000)
                break;

            case `PEER_${node.libp2p.peerId.toString()}_CHAIN`:
                var cid = new TextDecoder().decode(msg.detail.data)
                cid = CID.parse(cid)
                var object = await retrieveJSObject(cid)
                await setChainObject(object)
                console.log("Chain copy created")
                break;

            case `PEER_${node.libp2p.peerId.toString()}_PK`:
                var data = JSON.parse(new TextDecoder().decode(msg.detail.data))
                var peer = data.peer
                var publicKey = data.publicKey
                setKey(peer, publicKey)
                setKey(peer, publicKey)
                console.log('Stored Public Key for peer: ', peer)
                var jsonData = {
                    peer: node.libp2p.peerId.toString(),
                    publicKey: pubKey
                }
                node.libp2p.services.pubsub.publish(`PEER_${peer}_PK_RES`, new TextEncoder().encode(JSON.stringify(jsonData)))
                break;

            case `PEER_${node.libp2p.peerId.toString()}_PK_RES`:
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

            case 'BACKUP_NODE_APPROVE_TRANSACTION':
                var data = new TextDecoder().decode(msg.detail.data)
                data = data.split(' ')
                var peer = data[0]
                var transaction = data[1]
                var signature = data[2]
                var seq = data[3]
                var timeout = data[4]
                timeout *= 1000
                var verify = validate(transaction, signature, getKey(peer))
                setTimeout(() => {
                    node.libp2p.services.pubsub.publish('VOTE_COUNT', new TextEncoder().encode(verify + " " + seq))
                })
                break;
        }
    })
}
export default Subscribe