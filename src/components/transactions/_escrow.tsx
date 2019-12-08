import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  Card,
  CardHeader,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  Radio,
  ListItemText,
} from '@material-ui/core'
import { User } from 'radiks';
import UserCard from './_user';

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

interface EscrowListProps {
  escrows: Array<User>;
  onSelectedEscrow(escrow: User): void;
}

export default function EscrowList(props: EscrowListProps) {
  const classes = useStyles()
  const { escrows } = props
  const [selectedEscrowIndex, setSelectedEscrowIndex] = useState(-1)

  const handleToggle = (value: number) => () => {
    const selected: User = escrows[value]
    props.onSelectedEscrow(selected)
    setSelectedEscrowIndex(value)
  }

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Card>
        <CardHeader
          className={classes.cardHeader}
          title='Selecione um mediador'
          subheader={`Disponível ${escrows.length} mediador(es)`}
        />
        <Divider />
        <List className={classes.list} dense component="div" role="list">
          {escrows.map((escrow: User, idx: number) => {
            return (
              <ListItem
                key={idx} role="listitem"
                button
                onClick={handleToggle(idx)}
              >
                <ListItemAvatar>
                  <Radio
                    checked={selectedEscrowIndex === idx}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemAvatar>
                <ListItemText>
                  <UserCard user={escrow} />
                </ListItemText>
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
    </Grid>
  );
}
