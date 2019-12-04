import React, { useState, useEffect } from 'react'
import { UserSession } from 'blockstack';
import { Product } from '../../models/Product'
import PreviewProduct from './_show';
import {
  createStyles,
  GridList,
  makeStyles,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
    },
    gridList: {
      width: 500,
      height: 450,
      alignSelf: 'center',
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
  }),
);

interface ListProductsProps {
  userSession: UserSession;
  cartManager: {
    cart: Array<Product>;
    setCart(products: Array<Product>): void;
  }
}

export default function ListProducts(props: ListProductsProps) {
  const classes = useStyles();

  const { cart, setCart } = props.cartManager
  const [products, setProducts] = useState<Array<Product>>([])

  useEffect(() => {
    Product.fetchList().then((allProducts) => {
      setProducts(allProducts)
    })
  }, [props.userSession])

  const handleAddProductToCart = (product: Product) => {
    setCart([...cart, product])
  }

  return (
    <div className={classes.root}>
      <GridList cellHeight={160} className={classes.gridList} cols={3}>
        {products.map((product: Product) => (
          <PreviewProduct
            product={product}
            addProductToCart={handleAddProductToCart}
          />
        ))}
      </GridList>
    </div>
  )
}
