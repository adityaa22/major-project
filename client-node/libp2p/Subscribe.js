import node from "../Node/Node.js"
import { multiaddr } from '@multiformats/multiaddr'
import { CID } from 'multiformats/cid'
import os from 'os'
import { getChainObject, setChainObject } from "../Blockchain/data.js"
import { addJSObject, retrieveJSObject } from "../IPFS/Ipfs.js"
import { publicKey } from "../crypto/crypto.js"
import { setKey } from "../crypto/data.js"
import { fetchAndVerifyTransactionDetails, signTransaction } from "../transaction/transaction.js"

var Subscribe = () => {
    // subscribe to topics
    var pubKey = publicKey
    node.libp2p.services.pubsub.subscribe('PEER_ADDED')
    node.libp2p.services.pubsub.subscribe('FETCH_CPU_LOAD')
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_CHAIN`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_PK`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_PK_RES`)
    node.libp2p.services.pubsub.subscribe(`UPDATE_CHAIN`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_TRANSACTION_APPROVED`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_REJECT_TRANSACTION`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_CREATE_TRANSACTION`)
    node.libp2p.services.pubsub.subscribe(`PEER_${node.libp2p.peerId.toString()}_CHECK_TRANSACTION`)
    

    // listener for subscribed topics
    node.libp2p.services.pubsub.addEventListener('message', async (msg) => {
        var topic = msg.detail.topic;
        switch (topic) {
            case 'PEER_ADDED':
                var peerId = new TextDecoder().decode(msg.detail.data)
                var addrs = multiaddr(peerId);
                if (node.libp2p.getMultiaddrs()[1].toString() == peerId) {
                    return;
                }
                var id = peerId.split('/')[6]
                await node.libp2p.dial(addrs)
                var jsonData = {
                    peer: node.libp2p.peerId.toString(),
                    publicKey: pubKey
                }
                console.log(`Added a new peer (${id}), Current active peers: `, node.libp2p.getPeers())
                setTimeout(() => {
                    node.libp2p.services.pubsub.publish(`PEER_${id}_PK`, new TextEncoder().encode(JSON.stringify(jsonData)))
                },2000)
                break;

            case 'FETCH_CPU_LOAD':
                var cpuLoad = os.loadavg();
                console.log('CPU load is ' + cpuLoad[0]);
                node.libp2p.services.pubsub.publish('CPU_LOAD', new TextEncoder().encode(node.libp2p.peerId.toString() + " " + cpuLoad[0]))
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
            
            case `PEER_${node.libp2p.peerId.toString()}_TRANSACTION_APPROVED`:
                var transaction = new TextDecoder().decode(msg.detail.data)
                node.libp2p.services.pubsub.publish(`PEER_${node.libp2p.peerId.toString()}_ADDED_TRANSACTION`, new TextEncoder().encode(transaction))
                break;
            
            case `PEER_${node.libp2p.peerId.toString()}_REJECT_TRANSACTION`:
                node.libp2p.services.pubsub.publish(`PEER_${node.libp2p.peerId.toString()}_REJECTED_TRANSACTION`)
                break;
            
            case `PEER_${node.libp2p.peerId.toString()}_CREATE_TRANSACTION`:
                console.log(`creating transaction`)
                var obj = JSON.parse(new TextDecoder().decode(msg.detail.data))
                var cid = await addJSObject(obj)
                var signature = await signTransaction(cid.toString())
                node.libp2p.services.pubsub.publish('APPROVE_TRANSACTION', new TextEncoder().encode(node.libp2p.peerId.toString() + " " + cid + " " + signature))
                break;
            
            case `PEER_${node.libp2p.peerId.toString()}_CHECK_TRANSACTION`:
                var transaction = JSON.parse(new TextDecoder().decode(msg.detail.data))
                var owner = transaction.OwnerID
                var TransactionID = transaction.TransactionID
                var vehicleID = transaction.vehicleID
                console.log(`validating transaction Details...`)
                var data = await fetchAndVerifyTransactionDetails(TransactionID, owner, vehicleID)
                let message
                if (data) message = "successfully validated"
                else message = "validation failed"
                console.log(`status : ${message}`)
                node.libp2p.services.pubsub.publish(`PEER_${node.libp2p.peerId.toString()}_CHECKED_TRANSACTION`, new TextEncoder().encode(message))
                break;
        }
    })
}
export default Subscribe