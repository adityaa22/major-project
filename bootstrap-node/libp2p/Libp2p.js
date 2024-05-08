import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { autoNAT } from '@libp2p/autonat'
import { tcp } from '@libp2p/tcp'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { datastore } from './DataBlockStore.js'
import { identify } from '@libp2p/identify'

// libp2p is the networking layer that underpins Helia

const libp2p = await createLibp2p({
    datastore: datastore,
    services: {
        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
        identify: identify(),
        autoNAT: autoNAT()
    },
    addresses: {
        listen: [
            '/ip4/0.0.0.0/tcp/0'
        ],
    },
    transports: [
        tcp()
    ],
    connectionEncryption: [
        noise()
    ],
    streamMuxers: [
        yamux(),
        mplex()
    ],
})

export default libp2p