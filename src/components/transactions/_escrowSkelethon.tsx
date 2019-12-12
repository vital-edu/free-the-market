import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  Card,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton';
import UserCardSkelethon from './_userSkelethon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
    },
    cardHeader: {
      padding: theme.spacing(1, 2),
    },
    list: {
      width: 500,
      maxHeight: 500,
      backgroundColor: theme.palette.background.paper,
      overflow: 'auto',
    },
    button: {
      margin: theme.spacing(0.5, 0),
    },
  }),
)

export default function EscrowListSkelethon() {
  const classes = useStyles()

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Card>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Divider />
        <List className={classes.list} dense component="div" role="list">
          <ListItem
            role="listitem"
            button
            key={0}
          >
            <ListItemAvatar>
              <Skeleton variant="rect" width="42px" height="42px"/>
            </ListItemAvatar>
            <ListItemText>
              <UserCardSkelethon />
            </ListItemText>
          </ListItem>
          <ListItem />
        </List>
      </Card>
    </Grid>
  );
}
