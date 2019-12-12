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

export default function PreviewProductSkelethon() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item>
            <Skeleton variant="rect" width="200px" height="200px" />
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item xs>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </Grid>
            </Grid>
            <Grid item>
              <Skeleton variant="text" />
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
