import React, { useState, useEffect } from 'react'
import { UserSession } from 'blockstack';
import { Product } from '../../models/Product';
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

export default function ListProducts(props: { userSession: UserSession }) {
  const classes = useStyles();

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
    <div className={classes.root}>
      <GridList cellHeight={160} className={classes.gridList} cols={3}>
        {products.map((product: Product) => (
          <PreviewProduct product={product} />
        ))}
      </GridList>
    </div>
  )
}
