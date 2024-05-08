const keyPair = new Map()

function setKey(key, PK) {
    keyPair.set(key, PK)
}

function getKey(key) {
    return keyPair.get(key)
}

export {setKey, getKey}