import React, { useEffect, useState } from 'react'
import Transaction from '../../models/Transaction'

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
      {transaction && transaction!!.seller!!.attrs._id}
    </div>
  )
}
