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
  Typography,
} from '@material-ui/core'
import { useHistory } from 'react-router'
import { User } from '@vital-edu/radiks'
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
  const noProductStyle = {
    top: '50vh',
    transform: 'translateY(50%)',
    position: 'absolute' as const,
  }

  const { cart, setCart } = props.cartManager
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Array<Product>>([])

  useEffect(() => {
    Product.fetchList({
      user_id: `!=${User.currentUser()._id}`,
      status: ProductStatus.available,
    }).then((allProducts) => {
      setIsLoading(false)
      setProducts(allProducts as Array<Product>)
    })
  }, [props.userSession])

  const handleAddProductToCart = (product: Product) => {
    setCart([...cart, product])
    history.push('/transactions/new')
  }

  return (
    <Container className={classes.root}>
      {isLoading &&
        <GridList cellHeight={"auto"} className={classes.gridList} cols={3}>
          {Array(5).fill(0).map((_, idx) => (
            <PreviewProductSkelethon key={idx} />
          ))}
        </GridList>
      }
      {!isLoading && products.length > 0 &&
        <GridList cellHeight={160} className={classes.gridList} cols={3}>
          {products.map((product: Product, idx: number) => (
            <PreviewProduct
              key={idx}
              product={product}
              addProductToCart={handleAddProductToCart}
            />
          ))}
        </GridList>
      }
      {!isLoading && products.length === 0 &&
        <div style={noProductStyle}>
          <Typography gutterBottom variant="subtitle1">
            Não há produtos cadastrados na plataforma
          </Typography>
        </div>
      }
    </Container >
  )
}
