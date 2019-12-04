import { Model, User, Schema } from 'radiks';
import { Category } from "./Category";
import { UF } from "./UF";

export class Product extends Model {
  static className = 'Product'
  static schema: ProductSchema
}
export interface ProductSchema extends Schema {
  name: string;
  photos: Array<string>;
  price: number;
  category: Category;
  description: string;
  uf: UF;
}
