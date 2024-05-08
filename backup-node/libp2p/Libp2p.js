import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { bootstrap } from '@libp2p/bootstrap'
import { identify } from '@libp2p/identify'
import { mplex } from '@libp2p/mplex'
import { autoNAT } from '@libp2p/autonat'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { promisify } from 'util'
import { exec } from 'child_process'
import { datastore } from './DataBlockStore.js'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
const execute = promisify(exec)
const settingsFilePath = path.resolve(__dirname, '../../server-settings/settings.txt');

let serverID = await execute(`cat ${settingsFilePath}`)
serverID = serverID.stdout.trim()

// libp2p is the networking layer that underpins Helia
const libp2p = await createLibp2p({
    datastore: datastore,
    services: {
        identify: identify(),
        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
        autoNAT: autoNAT()
    },
    addresses: {
        listen: [
            '/ip4/0.0.0.0/tcp/0'
        ]
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
    peerDiscovery: [
        bootstrap({
            list: [
                `${serverID}`,
            ]
        })
    ]
})

export { libp2p }