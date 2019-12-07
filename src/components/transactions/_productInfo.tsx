import React from 'react'
import { User } from 'radiks'
import { Product } from '../../models/Product'
import PreviewProduct from '../products/_show'
import UserCard from './_user'

interface ProductInfoProps {
  product: Product;
  seller: User;
}

export default function ProductInfo(props: ProductInfoProps) {
  const { product, seller } = props

  return (
    <div>
      <PreviewProduct
        product={product}
      />
      <UserCard user={seller} cardTitle="Informações do Vendedor" />
    </div>
  )
}
