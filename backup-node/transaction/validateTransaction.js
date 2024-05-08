import crypto from 'crypto'

export const validate = (cid, signature, publicKey) => {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(cid);
    return verify.verify(publicKey, signature, 'hex');
}