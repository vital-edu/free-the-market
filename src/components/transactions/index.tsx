import React, { useEffect, useState } from 'react'
import Transaction, { TransactionStatus } from '../../models/Transaction'
import {
  Button,
  Container,
  Typography,
  makeStyles,
  createStyles,
  Theme,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
} from '@material-ui/core'
import {
  ExpandMore,
} from '@material-ui/icons'
import { User } from '@vital-edu/radiks'
import { useHistory } from "react-router"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: '20px',
    },
    gridList: {
      width: 500,
      minHeight: 450,
      alignSelf: 'center',
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
    loading: {
      flexDirection: 'column',
      justifyContent: 'center',
      height: '50vh',
      display: 'flex',
      alignItems: 'center',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }),
)

export default function ListTransactions() {
  const classes = useStyles()
  const history = useHistory()

  const [mySales, setMySales] = useState<Array<Transaction>>([])
  const [myPurchases, setMyPurchases] = useState<Array<Transaction>>([])
  const [myEscrows, setMyEscrows] = useState<Array<Transaction>>([])

  useEffect(() => {
    Transaction.fetchList({
      buyer_id: User.currentUser()._id,
      status: TransactionStatus.active,
    }).then((myTransactions) => {
      setMyPurchases(myTransactions as Array<Transaction>)
    })
  }, [])

  useEffect(() => {
    Transaction.fetchList({
      seller_id: User.currentUser()._id,
      status: TransactionStatus.active,
    }).then((myTransactions) => {
      setMySales(myTransactions as Array<Transaction>)
    })
  }, [])

  useEffect(() => {
    Transaction.fetchList({
      escrowee_id: User.currentUser()._id,
      status: TransactionStatus.active,
    }).then((myTransactions) => {
      setMyEscrows(myTransactions as Array<Transaction>)
    })
  }, [])

  const onTransactionClick = ((id: string) => {
    history.push(`/transactions/${id}`)
  })

  const transactionContainer = (
    title: string,
    transactions: Array<Transaction>
  ) => (transactions.length > 0 &&
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{title}:</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container spacing={3}>
          {transactions.map((t) => (
            <Grid item xs={12}>
              <Button
                fullWidth={true}
                variant="contained"
                color="primary"
                onClick={() => onTransactionClick(t._id)}>
                {t._id}
              </Button>
            </Grid>
          ))}
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
    )

  return (
    <Container className={classes.root}>
      {transactionContainer('Minhas compras', myPurchases)}
      {transactionContainer('Minhas vendas', mySales)}
      {transactionContainer('Transações em que sou mediador', myEscrows)}
    </Container>
  )
}
