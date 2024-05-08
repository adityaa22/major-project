import express from "express"
import cors from "cors"
import { exec } from 'child_process'
import path from 'path';
import bootstrapNode from './Node/BootstrapNode.js'
import Subscribe from './libp2p/Subscribe.js'
import { fileURLToPath } from 'url';
import { setChainObject } from "./Blockchain/data.js";
import Blockchain from "./Blockchain/blockchain.js";
import { router as AddCarRouter } from "./routes/AddCarRoute.js"
import { router as ListCarRouter } from "./routes/ListCarRoute.js"



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())



app.listen(9002, () => {
    const settingsFilePath = path.resolve(__dirname, '../server-settings/settings.txt');
    const multiaddrs = bootstrapNode.libp2p.getMultiaddrs()
    const command = `echo ${multiaddrs[1].toString()} > ${settingsFilePath}`;
    exec(command, function (error, stdOut, stdErr) {
        if (error) console.log(error);
        if (stdErr) console.log(stdErr);
    });
    
    console.log("Server Listening on PORT 9002")
})

app.use('/addcar', AddCarRouter)
app.use('/listcar', ListCarRouter)


await setChainObject(await new Blockchain().init())
Subscribe()


