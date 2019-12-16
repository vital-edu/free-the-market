import React, { useState, useEffect } from 'react'
import {
  Grid,
  makeStyles,
  createStyles,
  Theme,
  Button,
} from '@material-ui/core'
import { User, UserGroup } from '@vital-edu/radiks'
import * as bitcoin from 'bitcoinjs-lib'
import { Product } from '../../models/Product'
import { useHistory } from 'react-router'
import EscrowList from './_escrow'
import Transaction from './../../models/Transaction'
import ProductInfo from './_productInfo'
import EscrowListSkelethon from './_escrowSkelethon'
import ProductInfoSkelethon from './_productInfoSkelethon'

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
  }, [])

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
    const bitcoinExchangeRate = 3e4

    const transaction = new Transaction({
      product_id: product._id,
      buyer_id: User.currentUser()._id,
      seller_id: seller!!._id,
      escrowee_id: escrow!!._id,
      redeem_script: redeemScript,
      wallet_address: walletAddress,
      bitcoin_price: (product.attrs.price as number) / bitcoinExchangeRate
    })

    // create group
    const group = new UserGroup({ name: transaction._id })
    await group.create()

    // create invitations
    const seller_invitation = await group.makeGroupMembership(seller!!._id);
    const escrowee_invitation = await group.makeGroupMembership(escrow!!._id);

    transaction.update({
      seller_invitation: seller_invitation._id,
      escrowee_invitation: escrowee_invitation._id,
      userGroupId: group._id,
    })

    try {
      await transaction.save()
      history.push(`/transactions/${transaction._id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const readyToBuy = () => {
    return userPublicKey && sellerPublicKey && escrowPublicKey
  }

  return (
    <div>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        {product && seller ?
          <ProductInfo product={product} seller={seller} />
          : <ProductInfoSkelethon />
        }
        <form noValidate autoComplete="off" className={classes.root}>
          {escrows.length > 0 ? <EscrowList
            escrows={escrows}
            onSelectedEscrow={(escrow: User) => {
              setEscrow(escrow)
              setEscrowPublicKey(escrow.attrs.publicKey)
            }}
          /> : <EscrowListSkelethon />}
          {readyToBuy() &&
            <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={onBuy}>
              Comprar
              </Button>
          }
        </form>
      </Grid >
    </div>
  )
}
