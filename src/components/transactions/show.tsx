import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import Transaction, { BuyerStatus, SellerStatus } from '../../models/Transaction'
import ProductInfo from './_productInfo'
import UserCard from './_user'
import * as api from '../../utils/api'
import {
  TextField,
  makeStyles,
  createStyles,
  Theme,
  Button,
} from '@material-ui/core'
import qrcode from 'qrcode'
import TransactionStepper from './_stepper'
import { Product } from '../../models/Product'
import { User, UserGroup, GroupInvitation, Model } from 'radiks'

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

  const [transaction, setTransaction] = useState<Transaction | null>()
  const [QRCodeImage, setQRCodeImage] = useState('')
  const [remainingValue, setRemainingValue] = useState('')
  const [isFetchingBitcoinBalance, setIsFetchingBitcoinBalance] = useState(true)
  const [whoIsViewing, setWhoIsViewing] = useState(WhoIsViewing.undetermined)

  useEffect(() => {
    Transaction.findById(id).then(async (transaction) => {
      const myId = User.currentUser()._id

      setTransaction(transaction as Transaction)
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
        return history.push('/')
      }
    })
  }, [history, id])

  useEffect(() => {
    switch (whoIsViewing) {
      case WhoIsViewing.undetermined:
        return
      case WhoIsViewing.buyer:
        break
      case WhoIsViewing.seller:
        UserGroup.myGroups().then(async (groups: Array<UserGroup>) => {
          const group = groups.find((g) => {
            return g._id === transaction!!._id
          })
          if (!group) {
            console.log(transaction!!.attrs.seller_invitation_id as string)
            const inv = await GroupInvitation.findById(
              transaction!!.attrs.seller_invitation_id as string
            ) as Model;
            console.log(inv);
            (inv as unknown as GroupInvitation).activate()
          }
        })
        break
      case WhoIsViewing.escrowee:
        UserGroup.myGroups().then(async (groups: Array<UserGroup>) => {
          const group = groups.find((g) => {
            return g._id === transaction!!._id
          })
          if (!group) {
            console.log(transaction!!.attrs.escrowee_invitation_id as string)
            const inv = await GroupInvitation.findById(
              transaction!!.attrs.escrowee_invitation_id as string
            ) as Model;
            console.log(inv);
            (inv as unknown as GroupInvitation).activate()
          }
        })
        break
    }
  })

  useEffect(() => {
    if (whoIsViewing === WhoIsViewing.undetermined) return

    if (transaction && transaction.attrs.buyer_status === BuyerStatus.notPaid) {
      setIsFetchingBitcoinBalance(true)
      const timer = setInterval(async () => {
        const balance = await api.getWalletBalance(
          transaction.attrs.wallet_address
        )
        const priceToBePaid = transaction.attrs.bitcoin_price as number
        if (balance >= priceToBePaid) {
          transaction.update({
            buyer_status: BuyerStatus.paid,
          })
          await transaction.save()
          setTransaction(transaction)
        } else {
          setRemainingValue((priceToBePaid - balance).toFixed(8))
        }
        setIsFetchingBitcoinBalance(false)
      })

      return () => clearInterval(timer)
    }
  }, [whoIsViewing, transaction])

  const onUpdateSellerStatus = async (newStatus: SellerStatus) => {
    switch (newStatus) {
      case SellerStatus.delivered:
        transaction!!.update({ seller_status: newStatus })
        await transaction!!.save()
        setTransaction(transaction)
        break
      case SellerStatus.withdrawn:
        break
      case SellerStatus.requestedEscrowee:
        break
    }
  }

  const shouldShowWalletAddress = () => (
    whoIsViewing === WhoIsViewing.buyer &&
    transaction!!.attrs.buyer_status === BuyerStatus.notPaid
  )

  const shouldShowDeliveredButton = () => (
    whoIsViewing === WhoIsViewing.seller &&
    transaction!!.attrs.seller_status === SellerStatus.waiting
  )

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
            buyerStatus={transaction.attrs.buyer_status}
            sellerStatus={transaction.attrs.seller_status}
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
            <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={() => onUpdateSellerStatus(SellerStatus.delivered)}>
              Confirmar envio do produto/serviço
             </Button>
          }
        </div>
      }
    </div>
  )
}
