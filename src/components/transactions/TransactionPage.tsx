import React, { useState, useEffect } from 'react'
import {
  TextField,
  Grid,
  makeStyles,
  createStyles,
  Theme,
  Button,
} from '@material-ui/core'
import { User } from 'radiks'
import * as bitcoin from 'bitcoinjs-lib'
import { testnet } from 'bitcoinjs-lib/src/networks'
import * as api from '../../utils/api'
import { Product } from '../../models/Product'
import PreviewProduct from '../products/_show'
import SellerCard from './_seller'
import { useHistory } from 'react-router'

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
  const [sellerPublicKey] = useState(process.env.REACT_APP_KEY_2 as string)
  const [escrowPublicKey] = useState(process.env.REACT_APP_KEY_3 as string)
  const [generatedAddress, setGeneratedAddress] = useState('')
  const [payment, setPayment] = useState<bitcoin.Payment | null>(null)
  const [redeemScript, setRedeemScript] = useState<string>('')
  const [transaction, setTransaction] = useState('')
  const [product, setProduct] = useState<Product>(props.product)
  const [seller, setSeller] = useState<User | null>()
  const [escrows, setEscrows] = useState<Array<User>>([])

  useEffect(() => {
    console.log(props.product)
    if (props.product) {
      setProduct(product)
    } else history.push('/')

    User.currentUser().encryptionPublicKey().then((key) => {
      setUserPublicKey(key)
    })
  }, [product])

  useEffect(() => {
    User.fetchList().then((users) => {
      const availableEscrows = users.filter((u) => {
        if (u._id === product.attrs.user_id) {
          setSeller(u as User)
          return false
        }
        return (u._id !== User.currentUser()._id)
      }) as Array<User>
      setEscrows(availableEscrows)
    })
  }, [])

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

  const onCreateTransaction = () => { // 193
    let newPayment;
    newPayment = bitcoin.payments.p2ms({
      m: 2,
      pubkeys: keys.map(key => key.publicKey).sort(),
      network,
    });
    newPayment = (bitcoin.payments as any)['p2sh']({
      redeem: newPayment,
      network,
    });

    console.log(newPayment)
    console.log('payment.output: ' + newPayment.output.toString('hex'))
    console.log('payment.hash: ' + newPayment.hash.toString('hex'))
    setRedeemScript(newPayment!!.redeem!!.output!!.toString('hex'))
    setPayment(newPayment)
    setGeneratedAddress(newPayment.address as string)
  }

  const onTransfer = async () => {
    const inputs = await api.getInputs(generatedAddress, payment!!)
    if (!inputs) return

    console.log(inputs)
    console.log(payment!!.output!!)

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
      {product ?
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <PreviewProduct
            product={product}
          />
          {seller && <SellerCard seller={seller} />}
          <form noValidate autoComplete="off" className={classes.root}>
            <TextField
              fullWidth={true}
              label="Outlined"
              variant="outlined"
              value={userPublicKey}
            />
            <TextField
              fullWidth={true}
              label="Outlined"
              variant="outlined"
              value={sellerPublicKey}
            />
            <TextField
              fullWidth={true}
              label="Outlined"
              variant="outlined"
              value={escrowPublicKey}
            />
            <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={onCreateTransaction}>
              Criar transação transação
        </Button>
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
              label="Address"
              variant="outlined"
              value={generatedAddress}
              hidden={generatedAddress === ''}
              InputProps={{
                readOnly: true,
              }}
            />
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
