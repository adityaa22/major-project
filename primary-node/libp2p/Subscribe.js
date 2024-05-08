import node from "../Node/Node.js"
import { multiaddr } from '@multiformats/multiaddr'
import { CID } from 'multiformats/cid'
import os from 'os'
import { getChainObject, setChainObject } from "../Blockchain/data.js"
import { addJSObject, retrieveJSObject } from "../IPFS/Ipfs.js"
import { publicKey } from "../crypto/crypto.js"
import { setKey } from "../crypto/data.js"
import { generateSequenceNumber, getTimeout, getTotalTVote, getTotalVoteCount, getTransactionPeer, getTransactionSequence, increaseTVote, increaseTimeout, increaseVoteCount, setTransactionPeer, setTransactionSequence } from "../transaction/data.js"
import { createBlockData } from "../transaction/transaction.js"

const Subscribe = () => {
    // subscribe to topics
    var pubKey = publicKey
    node.libp2p.services.pubsub.subscribe('PEER_ADDED')
    node.libp2p.services.pubsub.subscribe('UPDATE_CHAIN')
    node.libp2p.services.pubsub.subscribe('VOTE_COUNT')
    node.libp2p.services.pubsub.subscribe('APPROVE_TRANSACTION')
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

            case 'APPROVE_TRANSACTION':
                var transactionData = new TextDecoder().decode(msg.detail.data)
                transactionData = transactionData.split(' ')
                var peer = transactionData[0]
                var transaction = transactionData[1]
                var signature = transactionData[2]
                var seq = (await generateSequenceNumber()).toString()
                await increaseTimeout(seq)
                var timeout = await getTimeout(seq)
                await setTransactionSequence(seq, transaction)
                await setTransactionPeer(transaction, peer)

                node.libp2p.services.pubsub.publish('BACKUP_NODE_APPROVE_TRANSACTION', new TextEncoder().encode(peer + " " + transaction + " " + signature + " " + seq + " " + timeout))

            case 'VOTE_COUNT':
                var voteData = new TextDecoder().decode(msg.detail.data)
                voteData = voteData.split(' ')
                var vote = voteData[0]
                var seq = voteData[1]
                if (vote == 'true') {
                    await increaseTVote(seq)
                }
                await increaseVoteCount(seq)
                console.log("Total Affirmative Votes: ", await getTotalTVote(seq))
                console.log("Total Vote Count: ", await getTotalVoteCount(seq))
                if (await getTotalVoteCount(seq) == 3) {
                    var transaction = await getTransactionSequence(seq)
                    var transactionCID = CID.parse(transaction)
                    var transactionDetails = await retrieveJSObject(transactionCID)
                    var vehicleID = transactionDetails.vehicleID
                    var peer = await getTransactionPeer(transaction)
                    if (await getTotalTVote(seq) >= 2) {
                        var blockData = await createBlockData(transaction, vehicleID)
                        var chain = await getChainObject()
                        await chain.addBlock(blockData, peer)
                        const cid = await addJSObject(chain)
                        node.libp2p.services.pubsub.publish(`UPDATE_CHAIN`, new TextEncoder().encode(cid))
                        node.libp2p.services.pubsub.publish(`PEER_${peer}_TRANSACTION_APPROVED`, new TextEncoder().encode(transaction))
                    } else {
                        node.libp2p.services.pubsub.publish(`PEER_${peer}_REJECT_TRANSACTION`)
                    }
                }
        }
    })
}
export default Subscribe