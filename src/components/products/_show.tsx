import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import { Product } from '../../models/Product';

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

export default function PreviewProduct(props: { product: Product }) {
  const classes = useStyles();
  const { product } = props;

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
              <Grid item>
                <Typography
                  align="center"
                  variant="body2"
                  style={{ cursor: 'pointer' }}>
                  Comprar
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
