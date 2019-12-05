import fetch from 'cross-fetch'
import { PsbtInputExtended } from 'bitcoinjs-lib/src/types'
import { Payment } from 'bitcoinjs-lib'

export async function getInputs(
  address: string,
  payment: Payment,
): Promise<Array<PsbtInputExtended>> {
  const getAddressUrl = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`

  const res = await fetch(getAddressUrl)
  const json = await res.json()

  return Promise.all(json.txrefs.map(async tx => {
    const getTxUrl = `https://api.blockcypher.com/v1/btc/test3/txs/${tx.tx_hash}?includeHex=true`

    const res = await fetch(getTxUrl)
    const json = await res.json()

    const input: PsbtInputExtended = {
      index: 0,
      hash: json.hash,
      nonWitnessUtxo: Buffer.from(json.hex, 'hex'),
      witnessScript: payment!!.redeem!!.output,
    }

    return input
  }))
}
