import { Model, Schema } from 'radiks';

export enum BuyerStatus {
  notPaid = 'not paid yet',
  paid = 'paid',
  received = 'received',
  withdrawn = 'payment was withdrawn',
  requestedEscrowee = 'requested escrowee intervention',
}

export enum SellerStatus {
  waiting = 'waiting',
  delivered = 'delivered',
  withdrawn = 'payment was withdrawn',
  requestedEscrowee = 'requested escrowee intervention',
}

export enum EscroweeStatus {
  notRequested = 'not requested',
  requestedBySeller = 'requested',
  tookBuyerSide = 'took buyer side',
  tookSellerSide = 'took seller side',
}

export enum TransactionStatus {
  active = 'active',
  inactive = 'inactive',
}

export default class Transaction extends Model {
  static className = 'Transaction'
  static schema: Schema = {
    product_id: {
      type: String,
      decrypted: true,
    },
    buyer_id: {
      type: String,
      decrypted: true,
    },
    seller_id: {
      type: String,
      decrypted: true,
    },
    escrowee_id: {
      type: String,
      decrypted: true,
    },
    redeem_script: {
      type: String,
      decrypted: true,
    },
    wallet_address: {
      type: String,
      decrypted: true,
    },
    bitcoin_price: {
      type: Number,
      decrypted: true,
    },
    buyer_redeem_script: {
      type: String,
      decrypted: true,
    },
    seller_redeem_seller: {
      type: String,
      decrypted: true,
    },
    buyer_status: {
      type: BuyerStatus,
      decrypted: true,
    },
    seller_status: {
      type: SellerStatus,
      decrypted: true,
    },
    escrowee_status: {
      type: String,
      decrypted: true,
    },
    status: {
      type: TransactionStatus,
      decrypted: true,
    },
  }

  static defaults = {
    buyer_status: BuyerStatus.notPaid,
    seller_status: SellerStatus.waiting,
    escrowee_status: EscroweeStatus.notRequested,
    status: TransactionStatus.active,
    buyer_redeem_script: '',
    seller_redeem_script: '',
  }
}
