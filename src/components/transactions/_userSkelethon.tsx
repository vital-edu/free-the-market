import React from 'react';
import {
  createStyles,
  makeStyles,
  Theme,
  Grid,
  Paper,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

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

export default function UserCardSkelethon() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Skeleton variant="rect" width="470px" height="470px" />
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item xs>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" height="21px" />
                <Skeleton variant="rect" width="40%" height="24px"/>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div >
  )
}
