import React, { useState, useEffect } from 'react'
import { UserSession } from 'blockstack';
import { Product } from '../../models/Product';
import PreviewProduct from './_show';

export default function ListProducts(props: { userSession: UserSession }) {
  const [products, setProducts] = useState<Array<Product>>([])

  useEffect(() => {
    const options = { decrypt: false }
    props.userSession.getFile('products.json', options)
      .then((file) => {
        const products = JSON.parse(file as string || '[]')
        setProducts(products)
      })
      .catch((error) => {
        console.log('could not fetch products')
      })
  }, [props.userSession])

  return (
    <div>
      {products.map((product: Product) => (
        <PreviewProduct product={product} />
      ))}
    </div>
  )
}
