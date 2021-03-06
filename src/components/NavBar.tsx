import React from 'react'
import '../styles/NavBar.css'
import {
  ExitToAppRounded,
  Receipt,
} from '@material-ui/icons'
import {
  AppBar,
  Button,
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Toolbar,
  Typography,
  Badge,
} from '@material-ui/core'
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

interface NavBarProps {
  username: string;
  user: any;
  signOut(e: React.MouseEvent): void;
  numberOfProductsOnCart: number;
}

export default function NavBar(props: NavBarProps) {
  const { user, signOut, numberOfProductsOnCart } = props
  const history = useHistory()

  const classes = useStyles();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    history.push('/profile')
  }

  const handleHomeButton = () => {
    if (history.location.pathname !== '/') {
      history.push('/')
    }
  }

  const handleTransactionButton = () => {
    if (history.location.pathname !== '/transactions') {
      history.push('/transactions')
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Button
              onClick={handleHomeButton}
              color="inherit">
              Free the Market
              </Button>
          </Typography>
          {user && (
            <div>
              <IconButton color="default">
                <Badge badgeContent={numberOfProductsOnCart}>
                  <Receipt onClick={handleTransactionButton}/>
                </Badge>
              </IconButton>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <img
                  src={user.avatarUrl() ? user.avatarUrl() : './avatar-placeholder.png'}
                  className="avatar"
                  width="25"
                  height="25"
                  alt=""
                />
              </IconButton>
              <IconButton color="default" onClick={signOut}>
                <ExitToAppRounded />
              </IconButton>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  )
}
