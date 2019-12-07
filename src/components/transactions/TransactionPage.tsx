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
import UserCard from './_user'
import { useHistory } from 'react-router'
import EscrowList from './_escrow'
import qrcode from 'qrcode'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    addressRoot: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
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
  const [QRCodeImage, setQRCodeImage] = useState('')

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

  useEffect(() => {
    if (props.product) {
      setProduct(product)
    } else {
      history.push('/')
      return
    }

    setUserPublicKey(User.currentUser().attrs.publicKey)

    User.fetchList().then((users) => {
      const availableEscrows = users.filter((u) => {
        if (u._id === props.product.attrs.user_id) {
          setSeller(u as User)
          setSellerPublicKey(u.attrs.publicKey)
          return false
        }
        return (u._id !== User.currentUser()._id)
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

    setQRCodeImage(await qrcode.toDataURL(`bitcoin:${walletAddress}`))
    setGeneratedAddress(walletAddress)
  }

  const readyToBuy = () => {
    return userPublicKey && sellerPublicKey && escrowPublicKey
  }

  const onCreateTransaction = async () => {
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

    setRedeemScript(newPayment!!.redeem!!.output!!.toString('hex'))
    setPayment(newPayment)
    setGeneratedAddress(newPayment.address as string)
  }

  const onTransfer = async () => {
    const inputs = await api.getInputs(generatedAddress, payment!!)
    if (!inputs) return

    // console.log(inputs)
    // console.log(payment!!.output!!)

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
          {seller &&
            <UserCard user={seller} cardTitle="Informações do Vendedor" />
          }
          <form noValidate autoComplete="off" className={classes.root}>
            {escrows && <EscrowList
              escrows={escrows}
              onSelectedEscrow={(escrow: User) => {
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
            {generatedAddress &&
              <div className={classes.addressRoot}>
                <img src={QRCodeImage} />
                <TextField
                  fullWidth={true}
                  label="Endereço Bitcoin"
                  variant="outlined"
                  value={generatedAddress}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
            }
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
