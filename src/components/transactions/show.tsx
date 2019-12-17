import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import Transaction, { BuyerStatus, SellerStatus, TransactionStatus } from '../../models/Transaction'
import ProductInfo from './_productInfo'
import UserCard from './_user'
import * as api from '../../utils/api'
import {
  TextField,
  makeStyles,
  createStyles,
  Theme,
  Button,
  Typography,
} from '@material-ui/core'
import * as walletValidator from 'wallet-address-validator'
import qrcode from 'qrcode'
import TransactionStepper from './_stepper'
import { Product } from '../../models/Product'
import { User, GroupInvitation, UserGroup } from '@vital-edu/radiks'
import { encryptECIES, decryptECIES } from 'blockstack/lib/encryption'
import * as bitcoin from 'bitcoinjs-lib'
import { testnet } from 'bitcoinjs-lib/src/networks'
import * as transactionUtils from '../../utils/transactionUtils'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addressRoot: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    withdrawForm: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
    },
    withdrawWallet: {
      width: '50%',
      padding: 8,
    }
  }),
);

enum WhoIsViewing {
  undetermined,
  buyer,
  seller,
  escrowee,
}

interface ShowTransactionProps {
  match: {
    params: {
      id: string;
    };
  };
}

export default function ShowTransaction(props: ShowTransactionProps) {
  const classes = useStyles()
  const { id } = props.match.params
  const history = useHistory()
  const bitcoinWalletAddressSize = 35
  const bitcoinFee = 3e3

  const [transaction, setTransaction] = useState<Transaction | null>()
  const [QRCodeImage, setQRCodeImage] = useState('')
  const [remainingValue, setRemainingValue] = useState('')
  const [isFetchingBitcoinBalance, setIsFetchingBitcoinBalance] = useState(true)
  const [whoIsViewing, setWhoIsViewing] = useState(WhoIsViewing.undetermined)
  const [withdrawWallet, setWithdrawWallet] = useState('')
  const [addressIsValid, setAddressIsValid] = useState(true)
  const [buyerStatus, setBuyerStatus] = useState(BuyerStatus.notPaid)
  const [sellerStatus, setSellerStatus] = useState(SellerStatus.waiting)

  // get transaction data
  useEffect(() => {
    Transaction.findById(id).then(async (transaction) => {
      const myId = User.currentUser()._id

      setTransaction(transaction as Transaction)
      setBuyerStatus(transaction.attrs.buyer_status)
      setSellerStatus(transaction.attrs.seller_status)
      setQRCodeImage(await qrcode.toDataURL(
        `bitcoin:${transaction!!.attrs.wallet_address}`
      ))

      if (transaction!!.attrs.buyer_id === myId) {
        setWhoIsViewing(WhoIsViewing.buyer)
      } else if (transaction!!.attrs.seller_id === myId) {
        setWhoIsViewing(WhoIsViewing.seller)
      } else if (transaction!!.attrs.escrowee === myId) {
        setWhoIsViewing(WhoIsViewing.escrowee)
      } else {
        history.push('/')
      }
    })
  }, [])

  // prepare transaction based on who is viewing
  useEffect(() => {
    switch (whoIsViewing) {
      case WhoIsViewing.undetermined:
        return
      case WhoIsViewing.buyer:
        return
      case WhoIsViewing.seller:
        UserGroup.myGroups().then(async () => {
          try {
            const invitation = await GroupInvitation.findById(
              transaction!!.attrs.seller_invitation
            ) as GroupInvitation
            await invitation.activate()
          } catch (error) {
            console.error(error)
          }
        })
        return
      case WhoIsViewing.escrowee:
        break
    }
  }, [whoIsViewing])

  // check wallet balance
  useEffect(() => {
    if (whoIsViewing === WhoIsViewing.undetermined) return

    if (transaction && buyerStatus === BuyerStatus.notPaid) {
      checkWalletBalance()
      const timer = setInterval(async () => {
        if (buyerStatus !== BuyerStatus.notPaid) {
          clearInterval(timer)
          return
        }

        await checkWalletBalance()
      }, 10000)

      return () => clearInterval(timer)
    }
  }, [whoIsViewing, buyerStatus])

  const checkWalletBalance = async () => {
    setIsFetchingBitcoinBalance(true)
    const balance = await api.getWalletBalance(
      transaction!!.attrs.wallet_address
    )
    const priceToBePaid = transaction!!.attrs.bitcoin_price as number
    if (balance >= priceToBePaid) {
      transaction!!.update({
        buyer_status: BuyerStatus.paid,
      })
      await transaction!!.save()
    } else {
      setRemainingValue((priceToBePaid - balance).toFixed(8))
    }
    setIsFetchingBitcoinBalance(false)
  }

  const onUpdateSellerStatus = async (newStatus: SellerStatus) => {
    switch (newStatus) {
      case SellerStatus.delivered:
        transaction!!.update({
          seller_status: newStatus,
          seller_wallet: withdrawWallet,
        })
        await transaction!!.save()
        break
      case SellerStatus.withdrawn:
        break
      case SellerStatus.requestedEscrowee:
        break
    }
    setSellerStatus(newStatus)
  }

  const onUpdateBuyerStatus = async (newStatus: BuyerStatus) => {
    switch (newStatus) {
      case BuyerStatus.received:
        // verify balance of wallet
        const balance = await api.getWalletBalance(
          transaction!!.attrs.wallet_address,
          true,
        )
        const withdrawnValue = balance - bitcoinFee
        if (withdrawnValue <= 0) {
          console.error('insufficient balance')
          return
        }

        const inputs = await api.getInputs(
          transaction!!.attrs.wallet_address,
          transaction!!.attrs.redeem_script,
        )
        if (inputs.length === 0) {
          console.error('the wallet does not have unspent output.')
        }

        let psbt = new bitcoin.Psbt({ network: testnet })
          .addInputs(inputs)
          .addOutput({
            address: transaction!!.attrs.seller_wallet,
            value: withdrawnValue
          })

        psbt.signAllInputs(bitcoin.ECPair.fromPrivateKey(Buffer.from(
          User.currentUser().encryptionPrivateKey(), 'hex'
        )))

        // encrypt psbt before send to improve security
        const encodedPSBT = psbt.toBase64()
        const sellerPublicKey = transaction!!.seller!!.attrs.publicKey
        const encryptedRedeem = encryptECIES(sellerPublicKey, encodedPSBT)
        transaction!!.update({
          buyer_status: newStatus,
          seller_redeem_script: encryptedRedeem,
        })
        await transaction!!.save()
        break
    }
    setBuyerStatus(newStatus)
  }

  const shouldShowWalletAddress = () => (
    whoIsViewing === WhoIsViewing.buyer &&
    transaction!!.attrs.buyer_status === BuyerStatus.notPaid
  )

  const shouldShowDeliveredButton = () => (
    whoIsViewing === WhoIsViewing.seller &&
    transaction!!.attrs.seller_status === SellerStatus.waiting
  )

  const shouldShowConfirmReceiptButton = () => (
    whoIsViewing === WhoIsViewing.buyer &&
    transaction!!.attrs.seller_status === SellerStatus.delivered &&
    transaction!!.attrs.buyer_status !== BuyerStatus.received
  )

  const shouldShowWithdrawButton = () => {
    if (whoIsViewing === WhoIsViewing.seller) {
      return (transaction!!.attrs.seller_redeem_script)
    } else if (whoIsViewing === WhoIsViewing.buyer) {
      return (transaction!!.attrs.buyer_redeem_script)
    }
    return false
  }

  const validateBTCWallet = (walletAddress: string): boolean => {
    const valid = walletValidator.validate(walletAddress, 'bitcoin', 'testnet')
    setAddressIsValid(valid)
    return valid
  }

  const onWithdrawMoney = async () => {
    // decrypt redeem script
    const encodedPSBT = decryptECIES(
      User.currentUser().encryptionPrivateKey(),
      transaction!!.attrs.seller_redeem_script
    )

    // sign inputs
    const psbt = bitcoin.Psbt.fromBase64(encodedPSBT as string)
    psbt.signAllInputs(bitcoin.ECPair.fromPrivateKey(
      Buffer.from(User.currentUser().encryptionPrivateKey(), 'hex')
    ))
    psbt.signAllInputs(transactionUtils.privateKeyFromId(transaction!!._id))

    const transactionIsValid = psbt.validateSignaturesOfAllInputs()
    if (!transactionIsValid) {
      console.error('transaction is invalid')
      return
    }

    // transfer money to withdraw wallet
    psbt.finalizeAllInputs()
    const tx = psbt.extractTransaction().toHex()

    const response = await api.propagateTransaction(tx)
    if (response.status !== 200) {
      console.error('error on propagate transaction: ', response.body)
      return
    }

    // update transaction status
    transaction!!.update({
      seller_status: SellerStatus.withdrawn,
      status: TransactionStatus.inactive
    })
    await transaction!!.save()
  }

  const onChangeWithdrawWallet = (e: React.ChangeEvent<{ value: string }>) => {
    const address = e.target.value
    validateBTCWallet(address)
    setWithdrawWallet(address)
  }

  return (
    <div>
      {transaction &&
        <div>
          <ProductInfo
            product={transaction.product as Product}
            seller={transaction.seller as User}
          />
          <UserCard
            user={transaction.escrowee as User}
            cardTitle="Informações do Escrowee"
          />
          <TransactionStepper
            buyerStatus={buyerStatus}
            sellerStatus={sellerStatus}
          />
          {shouldShowWalletAddress() &&
            <div className={classes.addressRoot}>
              {isFetchingBitcoinBalance
                ? 'Verificando saldo da carteira'
                : `Deposite BTC ${remainingValue} na carteira abaixo`
              }
              <img src={QRCodeImage} alt="wallet qr code" />
              <TextField
                fullWidth={true}
                label="Endereço Bitcoin"
                variant="outlined"
                value={transaction.attrs.wallet_address}
                InputProps={{
                  readOnly: true,
                }}
              />
            </div>
          }
          {shouldShowDeliveredButton() &&
            <form className={classes.withdrawForm} noValidate autoComplete="off">
              <Typography>
                Informe a carteira para qual deseja que depositemos o valor da transação:
               </Typography>
              <TextField
                error={!addressIsValid}
                className={classes.withdrawWallet}
                label="Endereço da sua carteira"
                value={withdrawWallet}
                onChange={onChangeWithdrawWallet}
                helperText={!addressIsValid &&
                  "O endereço fornecido não corresponde ao de uma carteira Bitcoin"
                }
              />
              <Button
                fullWidth={true}
                variant="contained"
                color="primary"
                disabled={!withdrawWallet || !addressIsValid}
                onClick={() => onUpdateSellerStatus(SellerStatus.delivered)}>
                Confirmar envio do produto/serviço
              </Button>
            </form>
          }
          {shouldShowConfirmReceiptButton() &&
            <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={() => onUpdateBuyerStatus(BuyerStatus.received)}>
              Confirmar recebimento do produto/serviço
            </Button>
          }
          {shouldShowWithdrawButton() &&
            <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={() => onWithdrawMoney()}>
              Sacar dinheiro para a sua carteira
            </Button>
          }
        </div>
      }
    </div>
  )
}
