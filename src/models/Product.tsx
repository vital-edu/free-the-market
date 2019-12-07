import { Model, User, Schema } from 'radiks';
import { Category } from "./Category";
import { UF } from "./UF";

export enum ProductStatus {
  available = 'available',
  unavailable = 'unavailable',
  onTransaction = 'on a transaction'
}

export class Product extends Model {
  static className = 'Product'
  static schema: Schema = {
    name: {
      type: String,
      decrypted: true,
    },
    photos: {
      type: Array,
      decrypted: true,
    },
    price: {
      type: Number,
      decrypted: true,
    },
    category: {
      type: Category,
      decrypted: true,
    },
    description: {
      type: String,
      decrypted: true,
    },
    uf: {
      type: UF,
      decrypted: true,
    },
    status: {
      type: ProductStatus,
      decrypted: true,
    },
    user_id: {
      type: String,
      decrypted: true,
    },
    transaction_id: {
      type: String,
      decrypted: true,
    },
  }

  static defaults = {
    status: ProductStatus.available,
  }

  async fromSchema() {
    this.attrs.photos = this.attrs.phothos.map((e: string) => JSON.parse(e))
  }
}
