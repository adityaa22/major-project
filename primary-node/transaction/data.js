const transactionSequenceMap = new Map()
const transactionPeerMap = new Map()
const sequenceVoteMap = new Map()
const TotalVoteMap = new Map()
const SequenceTimeOutMap = new Map()

export async function generateSequenceNumber(){
    return Date.now()
}

export async function setTransactionSequence(seqno, transaction) {
    transactionSequenceMap.set(seqno, transaction)
}

export async function getTransactionSequence(seqno) {
    console.log(transactionSequenceMap.get(seqno))
    return transactionSequenceMap.get(seqno)
}

export async function setTransactionPeer(transaction, peer) {
    transactionPeerMap.set(transaction, peer)
}

export async function getTransactionPeer(transaction){
    return transactionPeerMap.get(transaction)
}

export async function increaseTVote(seqno) {
    if (sequenceVoteMap.has(seqno)) {
        var vote = sequenceVoteMap.get(seqno)
        vote += 1
        sequenceVoteMap.set(seqno, vote)
    } else {
        sequenceVoteMap.set(seqno, 1)
    }
}

export async function getTotalTVote(seqno){
    return sequenceVoteMap.get(seqno)
}

export async function increaseVoteCount(seqno) {
    if (TotalVoteMap.has(seqno)) {
        var totalVote = TotalVoteMap.get(seqno)
        totalVote += 1
        TotalVoteMap.set(seqno, totalVote)
    } else {
        TotalVoteMap.set(seqno, 1)
    }
}

export async function increaseTimeout(seqno) {
    if (SequenceTimeOutMap.has(seqno)) {
        var timeout = SequenceTimeOutMap.get(seqno)
        timeout += 1
        SequenceTimeOutMap.set(seqno, timeout)
    } else {
        SequenceTimeOutMap.set(seqno, 1)
    }
}

export async function getTimeout(seqno) {
    return SequenceTimeOutMap.get(seqno)
}

export async function getTotalVoteCount(seqno){
    return TotalVoteMap.get(seqno)
}