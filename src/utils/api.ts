import fetch from 'cross-fetch'
import { PsbtInputExtended } from 'bitcoinjs-lib/src/types'

export async function getWalletData(address: string) {
  const getAddressUrl = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`

  const res = await fetch(getAddressUrl)
  return await res.json()
}

export async function getInputs(
  address: string,
  redeemScript: string,
): Promise<Array<PsbtInputExtended>> {
  const addressJson = await getWalletData(address)

  if (!addressJson.txrefs) return []
  return Promise.all(addressJson.txrefs.map(async tx => {
    const getTxUrl = `https://api.blockcypher.com/v1/btc/test3/txs/${tx.tx_hash}?includeHex=true`
    const vout = tx.tx_output_n

    const res = await fetch(getTxUrl)
    const txJson = await res.json()

    const input: PsbtInputExtended = {
      index: vout,
      hash: txJson.hash,
      nonWitnessUtxo: Buffer.from(txJson.hex, 'hex'),
      redeemScript: Buffer.from(redeemScript, 'hex'),
    }

    return input
  }))
}

export async function getWalletBalance(address: string, resultOnSatoshis = false) {
  const data = await getWalletData(address)

  if (resultOnSatoshis) return data.final_balance
  return data.final_balance / 1e8
}

export async function propagateTransaction(tx: string): Promise<Response> {
  return await fetch('https://api.blockcypher.com/v1/btc/test3/txs/push', {
    method: 'POST',
    body: JSON.stringify({ tx })
  })
}
