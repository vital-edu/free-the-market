import React, { useEffect, useState } from 'react';
import {
  Link,
  createStyles,
  makeStyles,
  Theme,
  ButtonBase,
  Grid,
  Paper,
  Typography,
  Button,
} from '@material-ui/core';
import { User } from 'radiks';
import { lookupProfile, Person } from 'blockstack';

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

const avatarFallbackImage = './../avatar-placeholder.png'

interface SellerCardProps {
  seller: User;
}

export default function SellerCard(props: SellerCardProps) {
  const classes = useStyles();

  const [seller, setSeller] = useState()

  useEffect(() => {
    lookupProfile(props.seller!!.attrs.username).then((profile) => {
      console.log({ person: new Person(profile) })
      setSeller(new Person(profile))
    })
  }, [])

  return (
    <div className={classes.root}>
      {seller &&
        <Paper className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item>
              <ButtonBase className={classes.image}>
                <img
                  src={seller.avatarUrl()
                    ? seller.avatarUrl()
                    : avatarFallbackImage}
                  width="100%"
                  height="100%"
                  alt="foto do vendedor"
                />
              </ButtonBase>
            </Grid>
            <Grid item xs={12} sm container>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  <Typography gutterBottom variant="h6">
                    Informações do Vendedor
                  </Typography>
                  <Typography gutterBottom variant="subtitle2">
                    {seller._profile.name ? seller._profile.name : 'Pessoa sem Nome'}
                  </Typography>
                  <Typography gutterBottom variant="subtitle1">
                    {seller._profile.description && seller._profile.description}
                    <Button
                      variant="outlined"
                      color="primary"
                      href={`https://explorer.blockstack.org/name/${seller._id}`}
                      target="_blank"
                    >
                      Ver perfil na BlockStack
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      }
    </div >
  )
}
