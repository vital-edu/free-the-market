import { Model, User, Schema } from 'radiks';
import { Category } from "./Category";
import { UF } from "./UF";

export class Product extends Model {
  static className = 'Product'
  static schema: Schema = {
    name: String,
    photos: Array,
    price: Number,
    category: Category,
    description: String,
    uf: UF,
  }

  afterFetch() {
    this.attrs.photos = this.attrs.phothos.map((e: string) => JSON.parse(e))
  }
}
