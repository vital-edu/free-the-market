import fetch from 'cross-fetch'
import { PsbtInputExtended } from 'bitcoinjs-lib/src/types'
import { Payment } from 'bitcoinjs-lib'

export async function getInputs(
  address: string,
  payment: Payment,
): Promise<Array<PsbtInputExtended> | null> {
  const getAddressUrl = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`

  const res = await fetch(getAddressUrl)
  const addressJson = await res.json()

  if (!addressJson.txrefs) return null
  return Promise.all(addressJson.txrefs.map(async tx => {
    const getTxUrl = `https://api.blockcypher.com/v1/btc/test3/txs/${tx.tx_hash}?includeHex=true`
    const vout = tx.tx_output_n

    const res = await fetch(getTxUrl)
    const txJson = await res.json()

    const input: PsbtInputExtended = {
      index: vout,
      hash: txJson.hash,
      nonWitnessUtxo: Buffer.from(txJson.hex, 'hex'),
      redeemScript: payment.redeem!!.output,
    }

    return input
  }))
}

export async function propagateTransaction(tx: string) {
  const res = await fetch('https://api.blockcypher.com/v1/btc/test3/txs/push', {
    method: 'POST',
    body: JSON.stringify({ tx })
  })
  console.log({ res })
}
