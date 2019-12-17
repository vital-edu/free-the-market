import * as bitcoin from 'bitcoinjs-lib'

export const bitcoinExchangeRate = 3e4

export function convertBRL2BTC(price: number) {
  return (price / 3e4).toFixed(8)
}

export function privateKeyFromId(id: string) {
  console.log(id)
  const hexId = id.replace(/-/g, '')
  const doubleHexId = hexId.repeat(2)
  console.log(doubleHexId)
  return bitcoin.ECPair.makeRandom({
    rng: () => Buffer.from(doubleHexId, 'hex')
  })
}
