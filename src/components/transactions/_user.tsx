import React, { useEffect, useState } from 'react';
import {
  createStyles,
  makeStyles,
  Theme,
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

interface UserCardProps {
  user: User;
  cardTitle?: string;
}

export default function UserCard(props: UserCardProps) {
  const classes = useStyles();

  const [user, setUser] = useState()

  useEffect(() => {
    lookupProfile(props.user!!.attrs.username).then((profile) => {
      setUser(new Person(profile))
    })
  }, [props.user])

  return (
    <div className={classes.root}>
      {user &&
        <Paper className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item>
              <img
                src={user.avatarUrl()
                  ? user.avatarUrl()
                  : avatarFallbackImage}
                width="100%"
                height="100%"
                alt="foto do vendedor"
              />
            </Grid>
            <Grid item xs={12} sm container>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  {props.cardTitle &&
                    <Typography gutterBottom variant="h6">
                      {props.cardTitle}
                    </Typography>
                  }
                  <Typography gutterBottom variant="subtitle2">
                    {user._profile.name ? user._profile.name : 'Pessoa sem Nome'}
                    {` (${props.user._id})`}
                  </Typography>
                  <Typography gutterBottom variant="subtitle1">
                    {user._profile.description && user._profile.description}
                    <br />
                    <Button
                      variant="outlined"
                      color="primary"
                      href={`https://explorer.blockstack.org/name/${props.user._id}`}
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
