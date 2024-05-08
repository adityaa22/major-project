const sequenceMap = new Map()

function setSequence(seq, transaction) {
    sequenceMap.set(seq, transaction)
}

function getSequence(seq) {
    return sequenceMap.get(seq)
}