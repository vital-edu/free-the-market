import { Model, Schema, User } from '@vital-edu/radiks';
import { Product } from './Product';

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
  waiting = 'waiting',
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
    seller_redeem_script: {
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
      type: EscroweeStatus,
      decrypted: true,
    },
    status: {
      type: TransactionStatus,
      decrypted: true,
    },
    seller_invitation: {
      type: String,
      decrypted: true,
    },
    escrowee_invitation: {
      type: String,
      decrypted: true,
    },
    userGroupId: {
      type: String,
      decrypted: true,
    },
    seller_wallet: {
      type: String,
      decrypted: true,
    },
    buyer_wallet: {
      type: String,
      decrypted: true,
    },
    escrowee_wallet: {
      type: String,
      decrypted: true,
    }
  }

  product?: Product
  seller?: User
  buyer?: User
  escrowee?: User

  static defaults = {
    buyer_status: BuyerStatus.notPaid,
    seller_status: SellerStatus.waiting,
    escrowee_status: EscroweeStatus.waiting,
    status: TransactionStatus.active,
    buyer_redeem_script: '',
    seller_redeem_script: '',
  }

  async afterFetch() {
    this.product = await Product.findById(this.attrs.product_id) as Product
    this.seller = await User.findById(this.attrs.seller_id) as User
    this.buyer = await User.findById(this.attrs.buyer_id) as User
    this.escrowee = await User.findById(this.attrs.escrowee_id) as User
  }
}
