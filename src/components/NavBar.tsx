import React from 'react'
import '../styles/NavBar.css'
import {
  AccountCircle,
  ShoppingCartRounded,
  ExitToAppRounded,
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

  const classes = useStyles();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    window.location.href = 'profile'
  };

  const handleHomeButton = () => {
    if (window.location.pathname !== '/') {
      window.location.href = '/'
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
                  <ShoppingCartRounded />
                </Badge>
              </IconButton>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user.avatarUrl() ?
                  <img
                    src={user.avatarUrl() ? user.avatarUrl() : './avatar-placeholder.png'}
                    className="avatar"
                    width="25"
                    height="25"
                    alt=""
                  />
                  : <AccountCircle />
                }
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
