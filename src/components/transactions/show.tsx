import React, { useEffect, useState } from 'react'
import Transaction from '../../models/Transaction'
import ProductInfo from './_productInfo'
import UserCard from './_user'
import { TextField, makeStyles, createStyles, Theme } from '@material-ui/core'
import qrcode from 'qrcode'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addressRoot: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
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

  useEffect(() => {
    Transaction.findById(id).then(async (transaction) => {
      setTransaction(transaction as Transaction)
      setQRCodeImage(await qrcode.toDataURL(
        `bitcoin:${transaction!!.attrs.wallet_address}`
      ))
    })
  }, [])

  return (
    <div>
      {transaction &&
        <div>
          <ProductInfo
            product={transaction.product!!}
            seller={transaction.seller!!}
          />
          <UserCard
            user={transaction.escrowee!!}
            cardTitle="Informações do Escrowee"
          />
          <div className={classes.addressRoot}>
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
        </div>
      }
    </div>
  )
}
