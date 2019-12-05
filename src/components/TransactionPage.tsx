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
import * as api from '../utils/api'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

export default function TransactionPage() {
  const classes = useStyles();

  const [userPublicKey, setUserPublicKey] = useState('')
  const [sellerPublicKey] = useState(process.env.REACT_APP_KEY_2 as string)
  const [escrowPublicKey] = useState(process.env.REACT_APP_KEY_3 as string)
  const [generatedAddress, setGeneratedAddress] = useState('')
  const [payment, setPayment] = useState<bitcoin.Payment | null>(null)
  const [redeemScript, setRedeemScript] = useState<string>('')

  useEffect(() => {
    User.currentUser().encryptionPublicKey().then((key) => {
      setUserPublicKey(key)
    })
  })

  const onCreateTransaction = () => { // 193
    const pubkeys = [
      userPublicKey,
      sellerPublicKey,
      escrowPublicKey,
    ].map(hex => Buffer.from(hex, 'hex'))

    const payment = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2ms({
        m: 2,
        pubkeys,
        network: bitcoin.networks.testnet,
      })
    })

    console.log(payment.redeem!!.output!!.toString('hex'))
    // console.log(payment.output!!.toString('hex'))

    setRedeemScript(payment!!.redeem!!.output!!.toString('hex'))
    setPayment(payment)
    setGeneratedAddress(payment.address as string)
  }

  const onTransfer = async () => {
    const myKeys = bitcoin.ECPair.fromPrivateKey(Buffer.from(
      process.env.REACT_APP_KEY_1 as string,
      'hex',
    ))
    const sellerKeys = bitcoin.ECPair.fromPrivateKey(Buffer.from(
      process.env.REACT_APP_KEY_2 as string,
      'hex',
    ))
    const moderatorKeys = bitcoin.ECPair.fromPrivateKey(Buffer.from(
      process.env.REACT_APP_KEY_3 as string,
      'hex',
    ))

    const inputs = await api.getInputs(generatedAddress, payment!!)

    console.log(inputs)
    console.log(inputs[0].nonWitnessUtxo.toString('hex'))
    console.log(inputs[0].witnessScript.toString('hex'))

    const psbt = new bitcoin.Psbt({ network: testnet })
      .addInputs(inputs)
      .addOutput({
        address: process.env.REACT_APP_BTC_ADDRESS,
        value: 1e5,
      })
    // .signInput(0, myKeys)
    // .signInput(0, sellerKeys)
    // .signInput(0, moderatorKeys)
    // .signAllInputs(myKeys)
    // .signAllInputs(sellerKeys)
    // .signAllInputs(moderatorKeys)

    console.log(psbt.toHex())
  }

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
    >

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
      </form>
    </Grid >
  )
}
