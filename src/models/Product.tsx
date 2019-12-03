import { Category } from "./Category";
import { UF } from "./UF";

export interface Product {
  photos: Array<File>;
  price: number;
  category: Category;
  description: string;
  uf: UF;
}
