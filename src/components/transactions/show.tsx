import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import Transaction, { BuyerStatus, SellerStatus, TransactionStatus, EscroweeStatus } from '../../models/Transaction'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
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
import LoadingDialog from '../LoadingDialog'

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

enum Favored {
  seller = 'seller',
  buyer = 'buyer',
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
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingTitle, setLoadingTitle] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingProgressShouldBe, setLoadingProgressShouldBe] = useState(0)
  const [hasAlert, setHasAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showWithdrawWalletInput, setShowWithdrawWalletInput] = useState(false)

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
      } else if (transaction!!.attrs.escrowee_id === myId) {
        setWhoIsViewing(WhoIsViewing.escrowee)
      } else {
        history.push('/')
      }
    })
  }, [history, id])

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

  // prepare transaction based on who is viewing
  useEffect(() => {
    setLoadingTitle('Obtendo dados da transação')
    setIsLoading(true)

    switch (whoIsViewing) {
      case WhoIsViewing.undetermined:
        break
      case WhoIsViewing.buyer:
        break
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
        UserGroup.myGroups().then(async () => {
          try {
            const invitation = await GroupInvitation.findById(
              transaction!!.attrs.escrowee_invitation
            ) as GroupInvitation
            await invitation.activate()
          } catch (error) {
            console.error(error)
          }
        })
        break
    }
    setLoadingProgressShouldBe(100)
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
  }, [whoIsViewing, buyerStatus, remainingValue, transaction])

  const checkWalletBalance = async () => {
    setIsFetchingBitcoinBalance(true)
    const balance = await api.getWalletBalance(
      transaction!!.attrs.wallet_address
    )
    const priceToBePaid = transaction!!.attrs.bitcoin_price as number
    if (balance >= priceToBePaid) {
      await onUpdateBuyerStatus(BuyerStatus.paid)
    } else {
      setRemainingValue((priceToBePaid - balance).toFixed(8))
    }
    setIsFetchingBitcoinBalance(false)
  }

  const onSetWithdrawStatus = async () => {
    if (whoIsViewing === WhoIsViewing.seller) {
      await onUpdateSellerStatus(SellerStatus.requestedEscrowee)
    } else {
      await onUpdateBuyerStatus(BuyerStatus.requestedEscrowee)
    }
    setShowWithdrawWalletInput(false)
  }

  const onUpdateSellerStatus = async (newStatus: SellerStatus) => {
    setLoadingTitle('Atualizando informações da transação')
    setIsLoading(true)

    switch (newStatus) {
      case SellerStatus.requestedEscrowee:
      case SellerStatus.delivered:
        transaction!!.update({
          seller_status: newStatus,
          seller_wallet: withdrawWallet,
        })
        await transaction!!.save()
        break
      case SellerStatus.withdrawn:
        break
    }

    setLoadingProgressShouldBe(100)
    setSellerStatus(newStatus)
  }

  const createSignedRedeemScript = async (favored: Favored) => {
    setLoadingTitle('Atualizando informações da transação')
    setIsLoading(true)
    // verify balance of wallet
    setLoadingMessage('Obtendo saldo da carteira')
    const balance = await api.getWalletBalance(
      transaction!!.attrs.wallet_address,
      true,
    )
    setLoadingProgressShouldBe(30)

    const withdrawnValue = balance - bitcoinFee
    if (withdrawnValue <= 0) {
      setLoadingProgressShouldBe(100)
      setHasAlert(true)
      setAlertMessage('Carteira sem saldo. A carteira pode estar com saldo não confirmado')
      return
    }

    setLoadingMessage('Coletando transações não gastas da carteira')
    const inputs = await api.getInputs(
      transaction!!.attrs.wallet_address,
      transaction!!.attrs.redeem_script,
    )
    setLoadingProgressShouldBe(60)
    if (inputs.length === 0) {
      setLoadingProgressShouldBe(100)
      setHasAlert(true)
      setAlertMessage('Carteira sem saldo. A carteira pode estar com saldo '
        + 'não confirmado.'
        + '<a target="_blank"'
        + 'href="https://live.blockcypher.com/btc-testnet/address/'
        + transaction!!.attrs.wallet_address + '">'
        + ' Verifique o saldo da carteira</a >.'
      )
      console.error('the wallet does not have unspent output.')
      return
    }

    setLoadingMessage('Assinando transação')
    let psbt = new bitcoin.Psbt({ network: testnet })
      .addInputs(inputs)
      .addOutput({
        address: transaction!!.attrs[`${favored}_wallet`],
        value: withdrawnValue
      })

    psbt.signAllInputs(bitcoin.ECPair.fromPrivateKey(Buffer.from(
      User.currentUser().encryptionPrivateKey(), 'hex'
    )))

    // encrypt psbt before send to improve security
    const encodedPSBT = psbt.toBase64()
    const favoredPublicKey = transaction!![favored]!!.attrs.publicKey
    return encryptECIES(favoredPublicKey, encodedPSBT)
  }

  const onTakeSideOnMediation = async (favored: Favored) => {
    setLoadingTitle('Atualizando informações da transação')
    setIsLoading(true)
    const encryptedRedeem = await createSignedRedeemScript(favored)
    if (!encryptedRedeem) return

    setLoadingMessage('Salvando dados da transação')

    if (favored === Favored.buyer) {
      transaction!!.update({
        escrowee_status: EscroweeStatus.tookBuyerSide,
        buyer_redeem_script: encryptedRedeem,
      })
    } else {
      transaction!!.update({
        escrowee_status: EscroweeStatus.tookSellerSide,
        seller_redeem_script: encryptedRedeem,
      })
    }
    await transaction!!.save()
    setLoadingProgressShouldBe(100)
  }

  const onUpdateBuyerStatus = async (newStatus: BuyerStatus) => {
    setLoadingTitle('Atualizando informações da transação')
    setIsLoading(true)

    switch (newStatus) {
      case BuyerStatus.received:
        const encryptedRedeem = await createSignedRedeemScript(Favored.seller)
        if (!encryptedRedeem) return

        setLoadingMessage('Salvando dados da transação')
        transaction!!.update({
          buyer_status: newStatus,
          seller_redeem_script: encryptedRedeem,
        })
        await transaction!!.save()
        break
      case BuyerStatus.requestedEscrowee:
        transaction!!.update({
          buyer_status: newStatus,
          buyer_wallet: withdrawWallet,
        })
        await transaction!!.save()
        break
      case BuyerStatus.paid:
        transaction!!.update({
          buyer_status: newStatus,
        })
        await transaction!!.save()
        break
    }

    setLoadingProgressShouldBe(100)
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
    if (transaction!!.attrs.seller_status === SellerStatus.withdrawn
      || transaction!!.attrs.buyer_status === BuyerStatus.withdrawn) return false

    if (whoIsViewing === WhoIsViewing.seller) {
      return (transaction!!.attrs.seller_redeem_script)
    } else if (whoIsViewing === WhoIsViewing.buyer) {
      return (transaction!!.attrs.buyer_redeem_script)
    }
    return false
  }

  const shouldShowRequestMediationButton = () => {
    if (whoIsViewing === WhoIsViewing.seller) {
      return transaction!!.attrs.seller_status === SellerStatus.delivered
    } else if (whoIsViewing === WhoIsViewing.buyer) {
      return transaction!!.attrs.buyer_status === BuyerStatus.paid
    }
    return false
  }

  const validateBTCWallet = (walletAddress: string): boolean => {
    const valid = walletValidator.validate(walletAddress, 'bitcoin', 'testnet')
    setAddressIsValid(valid)
    return valid
  }

  const onWithdrawMoney = async () => {
    setLoadingTitle('Sacando dinheiro')
    setIsLoading(true)

    // define which redeemScript to use
    const redeemScript = (whoIsViewing === WhoIsViewing.buyer)
      ? transaction!!.attrs.buyer_redeem_script
      : transaction!!.attrs.seller_redeem_script

    // decrypt redeem script
    setLoadingMessage('Assinando transação')
    const encodedPSBT = decryptECIES(
      User.currentUser().encryptionPrivateKey(),
      redeemScript,
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
    setLoadingProgressShouldBe(40)

    setLoadingMessage('Enviando transação para a rede Bitcoin')
    const response = await api.propagateTransaction(tx)
    if (response.status !== 201) {
      console.error('error on propagate transaction: ', response.body)
      return
    }
    setLoadingProgressShouldBe(60)

    // update transaction status
    setLoadingMessage('Atualizando dados da compra')
    transaction!!.update({
      seller_status: SellerStatus.withdrawn,
      status: TransactionStatus.inactive
    })
    await transaction!!.save()
    setLoadingProgressShouldBe(100)
  }

  const onChangeWithdrawWallet = (e: React.ChangeEvent<{ value: string }>) => {
    const address = e.target.value
    validateBTCWallet(address)
    setWithdrawWallet(address)
  }

  const shouldShowMediatorAcceptSellerRequestButton = (): boolean => (
    whoIsViewing === WhoIsViewing.escrowee
    && transaction!!.attrs.seller_status === SellerStatus.requestedEscrowee
  )

  const shouldShowMediatorAcceptBuyerRequestButton = (): boolean => (
    whoIsViewing === WhoIsViewing.escrowee
    && transaction!!.attrs.buyer_status === BuyerStatus.requestedEscrowee
  )

  const mediatorAlreadyTookSide = (): boolean => (
    whoIsViewing === WhoIsViewing.escrowee
    && transaction!!.attrs.escrowee_status !== EscroweeStatus.waiting
  )

  const getMediatorAlreadyTookSideMessage = (): React.ReactElement => (
    <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
    >
      {transaction!!.attrs.escrowee_status === EscroweeStatus.tookBuyerSide
        ? "Você deu ganho de causa para o comprador"
        : "Você deu ganho de causa para o vendedor"
      }
    </Grid>
  )

  return (
    <div>
      {isLoading && <LoadingDialog
        title={loadingTitle}
        message={loadingMessage}
        loadingProgress={loadingProgress}
      />}
      <Dialog
        open={hasAlert}
        onClose={() => setHasAlert(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Houve um erro</DialogTitle>
        <DialogContent>
          <div dangerouslySetInnerHTML={{__html: alertMessage}}></div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHasAlert(false)} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
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
          {shouldShowRequestMediationButton() &&
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowWithdrawWalletInput(true)}>
                Solicitar mediação
              </Button>
            </Grid>
          }
          {showWithdrawWalletInput &&
            <form className={classes.withdrawForm} noValidate autoComplete="off">
              <Typography>
                Informe a carteira para qual deseja que depositemos o valor da transação<br />caso o mediador lhe dê ganho de causa:
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
                variant="contained"
                color="primary"
                disabled={!withdrawWallet || !addressIsValid}
                onClick={() => onSetWithdrawStatus()}>
                Confirmar pedido de mediação
              </Button>
            </form>
          }
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
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <TextField
                  size="small"
                  style={{ width: 400 }}
                  label="Endereço Bitcoin"
                  variant="outlined"
                  value={transaction.attrs.wallet_address}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  href={`https://live.blockcypher.com/btc-testnet/address/${transaction.attrs.wallet_address}`}
                  target="_blank"
                >
                  Visualizar Carteira na BlockCypher
                </Button>
              </Grid>

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
        {mediatorAlreadyTookSide()
          ? getMediatorAlreadyTookSideMessage()
          : <div>
            {shouldShowMediatorAcceptSellerRequestButton() &&
              <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={() => onTakeSideOnMediation(Favored.seller)}>
              Tomar o lado do vendedor
              </Button>
            }
            {shouldShowMediatorAcceptBuyerRequestButton() &&
              <Button
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={() => onTakeSideOnMediation(Favored.buyer)}>
              Tomar o lado do comprador
              </Button>
            }
          </div>
        }
        </div>
      }
    </div >
  )
}
