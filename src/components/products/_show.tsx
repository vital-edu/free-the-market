import React from 'react';
import {
  Button,
  createStyles,
  makeStyles,
  Theme,
  ButtonBase,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import { ProductSchema } from '../../models/Product';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      margin: 'auto',
      maxWidth: 500,
    },
    image: {
      width: 128,
      height: 128,
    },
    img: {
      margin: 'auto',
      display: 'block',
      maxWidth: '100%',
      maxHeight: '100%',
    },
  }),
);

interface PreviewProductProps {
  product: ProductSchema;
  addProductToCart(product: ProductSchema): void
}

export default function PreviewProduct(props: PreviewProductProps) {
  const classes = useStyles();
  const { product } = props;

  const onHandleAddProductToCart = () => {
    props.addProductToCart(product)
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item>
            <ButtonBase className={classes.image}>
              {product.photos[0] && <img
                src={product.photos[0]}
                width="100%"
                alt="foto do produto"
              />}
            </ButtonBase>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item xs>
                <Typography gutterBottom variant="subtitle1">
                  {product.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {product.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ID: {product.id}
                </Typography>
              </Grid>
              <Grid item alignContent="center">
                <Typography
                  align="center"
                  variant="body2"
                >
                  <Button
                    color="primary"
                    onClick={onHandleAddProductToCart}
                  >
                    Comprar
                </Button>
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">${product.price}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
