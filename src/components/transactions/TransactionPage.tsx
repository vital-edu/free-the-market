import React, { useState, useEffect } from 'react'
import {
  TextField,
  Grid,
  makeStyles,
  createStyles,
  Theme,
  Button,
} from '@material-ui/core'
import { User, Model, UserGroup } from 'radiks'
import * as bitcoin from 'bitcoinjs-lib'
import { testnet } from 'bitcoinjs-lib/src/networks'
import * as api from '../../utils/api'
import { Product } from '../../models/Product'
import { useHistory } from 'react-router'
import EscrowList from './_escrow'
import Transaction from './../../models/Transaction'
import ProductInfo from './_productInfo'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

const network = bitcoin.networks.testnet

interface TransactionPageProps {
  product: Product
}

export default function TransactionPage(props: TransactionPageProps) {
  const classes = useStyles()
  const history = useHistory()

  const [userPublicKey, setUserPublicKey] = useState('')
  const [sellerPublicKey, setSellerPublicKey] = useState<string>('')
  const [escrowPublicKey, setEscrowPublicKey] = useState<string>('')
  const [generatedAddress, setGeneratedAddress] = useState('')
  const [payment, setPayment] = useState<bitcoin.Payment | null>(null)
  const [redeemScript, setRedeemScript] = useState<string>('')
  const [transaction, setTransaction] = useState('')
  const [product, setProduct] = useState<Product>(props.product)
  const [seller, setSeller] = useState<User | null>()
  const [escrows, setEscrows] = useState<Array<User>>([])
  const [escrow, setEscrow] = useState<User | null>()

  useEffect(() => {
    if (props.product) {
      setProduct(product)
    } else {
      history.push('/')
      return
    }

    setUserPublicKey(User.currentUser().attrs.publicKey)

    User.fetchList({ _id: `!=${User.currentUser()._id}` }).then((users) => {
      const availableEscrows = users.filter((u) => {
        if (u._id === props.product.attrs.user_id) {
          setSeller(u as User)
          setSellerPublicKey(u.attrs.publicKey)
          return false
        }
        return true
      }) as Array<User>
      setEscrows(availableEscrows)
    })
  }, [product, userPublicKey])

  const keys = [
    bitcoin.ECPair.fromPrivateKey(Buffer.from(
      process.env.REACT_APP_KEY_1 as string,
      'hex'
    ), { compressed: true, network, }),
    bitcoin.ECPair.fromPrivateKey(Buffer.from(
      process.env.REACT_APP_KEY_2 as string,
      'hex',
    ), { compressed: true, network, }),
    bitcoin.ECPair.fromPrivateKey(Buffer.from(
      process.env.REACT_APP_KEY_3 as string,
      'hex',
    ), { compressed: true, network, }),
  ].sort()

  const onBuy = async () => {
    const keys = [
      Buffer.from(userPublicKey, 'hex'),
      Buffer.from(sellerPublicKey, 'hex'),
      Buffer.from(escrowPublicKey, 'hex'),
    ].sort()
    let paymentWallet = bitcoin.payments.p2ms({
      m: 2,
      pubkeys: keys,
      network,
    })
    paymentWallet = bitcoin.payments.p2sh({
      redeem: paymentWallet,
      network,
    })
    const walletAddress = paymentWallet.address as string

    const redeemScript = paymentWallet.redeem!!.output!!.toString('hex')
    const bitcoinExchangeRate = 32 / 1e6

    const transaction = new Transaction({
      product_id: product._id,
      buyer_id: User.currentUser()._id,
      seller_id: seller!!._id,
      escrowee_id: escrow!!._id,
      redeem_script: redeemScript,
      wallet_address: walletAddress,
      bitcoin_price: (product.attrs.price as number) * bitcoinExchangeRate
    })

    try {
      const { _id } = await transaction.save() as Model

      // create group
      const group = new UserGroup({ name: _id })
      group.create()
      await group.makeGroupMembership(transaction.attrs.seller_id)
      await group.makeGroupMembership(transaction.attrs.escrowee_id)
      history.push(`/transactions/${_id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const readyToBuy = () => {
    return userPublicKey && sellerPublicKey && escrowPublicKey
  }

  const onTransfer = async () => {
    const inputs = await api.getInputs(generatedAddress, payment!!)
    if (!inputs) return

    let psbt = new bitcoin.Psbt({ network: testnet })
      .addInputs(inputs)
      .addOutput({
        address: process.env.REACT_APP_BTC_ADDRESS as string,
        value: 1e4,
      })
      .signAllInputs(keys[0])
      .signAllInputs(keys[1])
      .finalizeAllInputs()

    setTransaction(psbt.extractTransaction().toHex())
  }

  const onPropagateTransaction = async () => {
    await api.propagateTransaction(transaction)
  }

  return (
    <div>
      {product && seller ?
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
        >
          <ProductInfo product={product} seller={seller} />
          <form noValidate autoComplete="off" className={classes.root}>
            {escrows && <EscrowList
              escrows={escrows}
              onSelectedEscrow={(escrow: User) => {
                setEscrow(escrow)
                setEscrowPublicKey(escrow.attrs.publicKey)
              }}
            />}
            {readyToBuy() &&
              <Button
                fullWidth={true}
                variant="contained"
                color="primary"
                onClick={onBuy}>
                Comprar
              </Button>
            }
            <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={onTransfer}>
              Confirmar transação
            </Button>
            <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={onPropagateTransaction}>
              Confirmar transação
            </Button>
            <TextField
              fullWidth={true}
              label="Redeem Script"
              variant="outlined"
              value={redeemScript}
              hidden={redeemScript === ''}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              fullWidth={true}
              label="Transaction"
              variant="outlined"
              value={transaction}
              hidden={transaction === ''}
              InputProps={{
                readOnly: true,
              }}
            />
          </form>
        </Grid >
        : null}
    </div>
  )
}
