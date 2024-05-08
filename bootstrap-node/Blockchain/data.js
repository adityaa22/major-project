import Blockchain from "./blockchain.js";

var chainObject;

async function setChainObject(object) {
    chainObject = await new Blockchain().initCopy(object);
}
function getChainObject() {
    return chainObject;
}
export { setChainObject, getChainObject }