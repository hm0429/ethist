const ethers = require('ethers') // v5

const haloData = { "input": { "keyNo": 1, "digest": "04555ea392dd32661203733e3c49fc490bdc80557a7ac82aeadc562a0ea68faa" }, "signature": { "raw": { "r": "b9811bf7c0ebb7719de7c084025ea5d96f5af27273941fc959b5adb62b137c35", "s": "33d63f229190fa9aaeccd13d0c4de9d3a6bac416fe8e33acec487de79892cfa8", "v": 28 }, "der": "3046022100b9811bf7c0ebb7719de7c084025ea5d96f5af27273941fc959b5adb62b137c35022100cc29c0dd6e6f056551332ec2f3b2162b13f418cfb0ba6c8ed389e0a537a37199", "ether": "0xb9811bf7c0ebb7719de7c084025ea5d96f5af27273941fc959b5adb62b137c3533d63f229190fa9aaeccd13d0c4de9d3a6bac416fe8e33acec487de79892cfa81c" }, "publicKey": "04113bbaf2dd04b91a4ebd61789fa929e705ccf241b5cedf971bd7f13bac91edc77e4d0f646f697a3cd4b99c2f60632952ef446215cbe81e67985ea64f389c7d20", "etherAddress": "0xbFBD40229731F5C669c29202044f93e472c802d7" }
const nullifier_hash = '0x04555ea392dd32661203733e3c49fc490bdc80557a7ac82aeadc562a0ea68faa'

const expandedSig = {
    r: '0x' + haloData.signature.raw.r,
    s: '0x' + haloData.signature.raw.s,
    v: haloData.signature.raw.v
  }
const signature = ethers.utils.joinSignature(expandedSig)

const address = ethers.utils.recoverAddress(nullifier_hash, signature)
console.log('address:', address)