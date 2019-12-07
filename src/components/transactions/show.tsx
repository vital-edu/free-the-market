import React, { useEffect, useState } from 'react'
import Transaction, { BuyerStatus } from '../../models/Transaction'
import ProductInfo from './_productInfo'
import UserCard from './_user'
import * as api from '../../utils/api'
import {
  TextField,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core'
import qrcode from 'qrcode'
import TransactionStepper from './_stepper'
import { Product } from '../../models/Product'
import { User } from 'radiks'

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

  const [transaction, setTransaction] = useState<Transaction | null>()
  const [QRCodeImage, setQRCodeImage] = useState('')
  const [remainingValue, setRemainingValue] = useState('')
  const [isFetchingBitcoinBalance, setIsFetchingBitcoinBalance] = useState(true)

  useEffect(() => {
    Transaction.findById(id).then(async (transaction) => {
      setTransaction(transaction as Transaction)
      setQRCodeImage(await qrcode.toDataURL(
        `bitcoin:${transaction!!.attrs.wallet_address}`
      ))
    })
  }, [])

  useEffect(() => {
    if (transaction && transaction.attrs.buyer_status === BuyerStatus.notPaid) {
      let timer = setInterval(() => {
        setIsFetchingBitcoinBalance(true)
        api.getWalletBalance((transaction.attrs.wallet_address))
          .then(async balance => {
            const priceToBePaid = transaction.attrs.bitcoin_price as number
            if (balance >= priceToBePaid) {
              transaction.update({
                buyer_status: BuyerStatus.paid,
              })
              await transaction.save()
            } else {
              setRemainingValue((priceToBePaid - balance).toFixed(8))
            }
            setIsFetchingBitcoinBalance(false)
          })
      }, 10000) // every 10 seconds

      return () => clearTimeout(timer) // clear timeout when component unmount
    }
  }, [transaction])

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
          {transaction.attrs.buyer_status === BuyerStatus.notPaid &&
            <div className={classes.addressRoot}>
              {isFetchingBitcoinBalance
                ? 'Verificando saldo da carteira'
                : `Deposite BTC ${remainingValue} na carteira abaixo`
              }
              <img src={QRCodeImage} />
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
        </div>
      }
    </div>
  )
}
