import React, { useEffect, useState } from 'react'
import Transaction from '../../models/Transaction'
import ProductInfo from './_productInfo'
import UserCard from './_user'

interface ShowTransactionProps {
  match: {
    params: {
      id: string;
    };
  };
}

export default function ShowTransaction(props: ShowTransactionProps) {
  const { id } = props.match.params
  const [transaction, setTransaction] = useState<Transaction | null>()

  useEffect(() => {
    Transaction.findById(id).then((transaction) => (
      setTransaction(transaction as Transaction))
    )
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
        </div>
      }
    </div>
  )
}
