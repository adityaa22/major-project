import node from './Node/Node.js';
import Subscribe from './libp2p/Subscribe.js';

setTimeout(() => {
    const peerId = node.libp2p.peerId
    console.log("Trying to connect, peerId: ", peerId)
    node.libp2p.services.pubsub.publish('NEW_PEER', new TextEncoder().encode(node.libp2p.getMultiaddrs()[1].toString()))
}, 2000)

Subscribe()


