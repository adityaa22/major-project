import { Router } from 'express';
import bootstrapNode from '../Node/BootstrapNode.js';
import FETCH_CPU_LOAD from '../utils/CPULoad.js';
const router = Router();

router.post("/", async(req, res) => {
    const obj = req.body
    const peer = await FETCH_CPU_LOAD()
    bootstrapNode.libp2p.services.pubsub.publish(`PEER_${peer}_CHECK_TRANSACTION`, new TextEncoder().encode(JSON.stringify(obj)))
    bootstrapNode.libp2p.services.pubsub.subscribe(`PEER_${peer}_CHECKED_TRANSACTION`)
    // // subscription listener
    bootstrapNode.libp2p.services.pubsub.addEventListener('message', (msg) => {
        const topic = msg.detail.topic;
        switch (topic) {
            case `PEER_${peer}_CHECKED_TRANSACTION`:
                const message = new TextDecoder().decode(msg.detail.data)
                res.send({ msg: message})
                break;
        }
    })
})

export { router }