import { Router } from 'express';
import bootstrapNode from '../Node/BootstrapNode.js';
import FETCH_CPU_LOAD from '../utils/CPULoad.js';
const router = Router();

router.post("/", async(req, res) => {
    const obj = req.body
    const peer = await FETCH_CPU_LOAD()
    console.log(`PEER_${peer}_CREATE_TRANSACTION`)
    bootstrapNode.libp2p.services.pubsub.publish(`PEER_${peer}_CREATE_TRANSACTION`, new TextEncoder().encode(JSON.stringify(obj)))
    bootstrapNode.libp2p.services.pubsub.subscribe(`PEER_${peer}_TRANSACTION_APPROVED`)
    bootstrapNode.libp2p.services.pubsub.subscribe(`PEER_${peer}_REJECT_TRANSACTION`)

    // // subscription listener
    bootstrapNode.libp2p.services.pubsub.addEventListener('message', async (msg) => {
        const topic = msg.detail.topic;
        switch (topic) {
            case `PEER_${peer}_TRANSACTION_APPROVED`:
                var transaction = new TextDecoder().decode(msg.detail.data)
                res.send({ transaction: transaction })
                break;
            
            case `PEER_${peer}_REJECT_TRANSACTION`:
                res.send({ msg: 'Transaction Denied' })
                break;
        }
    })
})

export { router }