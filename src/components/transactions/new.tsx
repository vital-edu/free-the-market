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
import Transaction from '../../models/Transaction'
import ProductInfo from './_productInfo'
import EscrowListSkelethon from './_escrowSkelethon'
import ProductInfoSkelethon from './_productInfoSkelethon'
import LoadingDialog from '../LoadingDialog'
import * as transactionUtils from '../../utils/transactionUtils'

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
  const product = props.product

  const [userPublicKey, setUserPublicKey] = useState('')
  const [sellerPublicKey, setSellerPublicKey] = useState<string>('')
  const [escrowPublicKey, setEscrowPublicKey] = useState<string>('')
  const [seller, setSeller] = useState<User | null>()
  const [escrows, setEscrows] = useState<Array<User>>([])
  const [escrow, setEscrow] = useState<User | null>()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingTitle, setLoadingTitle] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingProgressShouldBe, setLoadingProgressShouldBe] = useState(0)

  useEffect(() => {
    if (!product) {
      history.push('/')
      return
    }

    setUserPublicKey(User.currentUser().attrs.publicKey)

    User.fetchList({ _id: `!=${User.currentUser()._id}` }).then((users) => {
      const availableEscrows = users.filter((u) => {
        if (u._id === product.attrs.user_id) {
          setSeller(u as User)
          setSellerPublicKey(u.attrs.publicKey)
          return false
        }
        return true
      }) as Array<User>
      setEscrows(availableEscrows)
    })
  }, [product, history])

  useEffect(() => {
    if (!isLoading) return
    let loadingTimer

    if (loadingProgress >= 100) {
      setIsLoading(false)
      setLoadingProgress(0)
    } else if (loadingProgress < loadingProgressShouldBe) {
      loadingTimer = setTimeout(() => {
        setLoadingProgress(loadingProgress + 1)
      }, 1)
    } else {
      loadingTimer = setTimeout(() => {
        setLoadingProgress(loadingProgress + 1)
      }, 500)
    }

    return () => clearInterval(loadingTimer)
  }, [isLoading, loadingProgress, loadingProgressShouldBe])

  const onBuy = async () => {
    setLoadingTitle('Processando Compra')
    setLoadingMessage('Coletando chaves públicas')
    setIsLoading(true)

    let transaction = new Transaction({
      product_id: product._id,
      buyer_id: User.currentUser()._id,
      seller_id: seller!!._id,
      escrowee_id: escrow!!._id,
      bitcoin_price: transactionUtils.convertBRL2BTC(product.attrs.price)
    })

    const keys = [
      Buffer.from(userPublicKey, 'hex'),
      Buffer.from(sellerPublicKey, 'hex'),
      Buffer.from(escrowPublicKey, 'hex'),
      transactionUtils.privateKeyFromId(transaction._id).publicKey
    ].sort()

    setLoadingMessage('Gerando carteira de pagamento da transação')
    let paymentWallet = bitcoin.payments.p2ms({
      m: 3,
      pubkeys: keys,
      network,
    })
    paymentWallet = bitcoin.payments.p2sh({
      redeem: paymentWallet,
      network,
    })
    const walletAddress = paymentWallet.address as string

    const redeemScript = paymentWallet.redeem!!.output!!.toString('hex')

    transaction.update({
      redeem_script: redeemScript,
      wallet_address: walletAddress,
    })

    // create group
    const group = new UserGroup({ name: transaction._id })
    await group.create()
    setLoadingProgressShouldBe(20)

    // create invitations
    setLoadingMessage('Compartilhando transação com vendedor')
    const seller_invitation = await group.makeGroupMembership(seller!!._id);
    setLoadingProgressShouldBe(40)
    setLoadingMessage('Compartilhando transação com mediador')
    const escrowee_invitation = await group.makeGroupMembership(escrow!!._id);
    setLoadingProgressShouldBe(60)

    setLoadingMessage('Registrando transação')
    transaction.update({
      seller_invitation: seller_invitation._id,
      escrowee_invitation: escrowee_invitation._id,
      userGroupId: group._id,
    })

    try {
      await transaction.save()
      setLoadingProgressShouldBe(100)
      while (isLoading) { }
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
      {isLoading && <LoadingDialog
        title={loadingTitle}
        message={loadingMessage}
        loadingProgress={loadingProgress}
      />}
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
