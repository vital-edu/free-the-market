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
    ].map(hex => Buffer.from(hex, 'hex')).sort()

    let newPayment;
    newPayment = bitcoin.payments.p2ms({
      m: 2,
      pubkeys: pubkeys,
      network: bitcoin.networks.testnet,
    });
    newPayment = (bitcoin.payments as any)['p2wsh']({
      redeem: newPayment,
      newtwork: bitcoin.networks.testnet,
    });
    newPayment = (bitcoin.payments as any)['p2sh']({
      redeem: newPayment,
      newtwork: bitcoin.networks.testnet,
    });

    console.log(newPayment.redeem!!.output!!.toString('hex'))
    console.log('payment.output: ' + newPayment!!.output!!.toString('hex'))

    setRedeemScript(newPayment!!.redeem!!.output!!.toString('hex'))
    setPayment(newPayment)
    setGeneratedAddress(newPayment.address as string)
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

    const allKeys = [myKeys, sellerKeys, moderatorKeys].sort()

    const inputs = await api.getInputs(generatedAddress, payment!!)

    console.log(inputs)
    // console.log(inputs[0].nonWitnessUtxo.toString('hex'))
    // console.log(inputs[0].witnessScript.toString('hex'))

    const psbt = new bitcoin.Psbt({ network: testnet })
      .addInputs(inputs)
      .addOutput({
        address: process.env.REACT_APP_BTC_ADDRESS as string,
        value: 1e4,
      })
      .signAllInputs(allKeys[0])
      .signAllInputs(allKeys[1])
      .signAllInputs(allKeys[2])

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
