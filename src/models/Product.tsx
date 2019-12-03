import { Category } from "./Category";
import { UF } from "./UF";

export interface Product {
  id: string;
  name: string;
  photos: Array<File>;
  price: number;
  category: Category;
  description: string;
  uf: UF;
}
