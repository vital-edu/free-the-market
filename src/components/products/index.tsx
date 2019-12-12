import React, { useState, useEffect } from 'react'
import { UserSession } from 'blockstack'
import { Product, ProductStatus } from '../../models/Product'
import PreviewProduct from './_show'
import {
  createStyles,
  GridList,
  makeStyles,
  Theme,
  Container,
} from '@material-ui/core'
import { useHistory } from 'react-router'
import { User } from 'radiks'
import ProductInfoSkelethon from '../transactions/_productInfoSkelethon'
import PreviewProductSkelethon from './_showSkelethon'

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
      minHeight: 450,
      alignSelf: 'center',
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
    loading: {
      flexDirection: 'column',
      justifyContent: 'center',
      height: '50vh',
      display: 'flex',
      alignItems: 'center',
    }
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
  const classes = useStyles()
  const history = useHistory()

  const { cart, setCart } = props.cartManager
  const [products, setProducts] = useState<Array<Product>>([])

  useEffect(() => {
    Product.fetchList({
      user_id: `!=${User.currentUser()._id}`,
      status: ProductStatus.available,
    }).then((allProducts) => {
      setProducts(allProducts as Array<Product>)
    })
  }, [props.userSession])

  const handleAddProductToCart = (product: Product) => {
    setCart([...cart, product])
    history.push('/transactions/new')
  }

  return (
    <Container className={classes.root}>
      {products.length > 0 ?
        <GridList cellHeight={160} className={classes.gridList} cols={3}>
          {products.map((product: Product, idx: number) => (
            <PreviewProduct
              key={idx}
              product={product}
              addProductToCart={handleAddProductToCart}
            />
          ))}
        </GridList>
        : <GridList cellHeight={"auto"} className={classes.gridList} cols={3}>{Array(5).fill(0).map(() => (
          <PreviewProductSkelethon />
        ))}
        </GridList>
      }
    </Container>
  )
}
