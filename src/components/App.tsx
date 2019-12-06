import React, { useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import Profile from './Profile'
import Signin from './Signin'
import { UserSession, Person } from 'blockstack'
import { appConfig, theme } from '../utils/constants'
import CreateProduct from './products/new'
import ListProducts from './products'
import NavBar from './NavBar'
import { Add as AddIcon } from '@material-ui/icons'
import { ThemeProvider, Fab, makeStyles, Theme, createStyles } from '@material-ui/core'
import { Product } from '../models/Product'
import { configure, getConfig, User } from 'radiks'
import Transaction from './TransactionPage'
import { useHistory } from "react-router"

const userSession = new UserSession({ appConfig })

configure({
  apiServer: process.env.REACT_APP_RADIKS_SERVER as string,
  userSession
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      position: 'absolute',
      right: 15,
      bottom: 15,
    }
  }),
);

export default function App() {
  const classes = useStyles();
  let history = useHistory()

  const [person, setPerson] = useState<Person>()
  const [username, setUsername] = useState<string>('')
  const [isUserSigned, setIsUserSigned] = useState(false)
  const [cart, _setCart] = useState<Array<Product>>([])

  useEffect(() => {
    const { userSession } = getConfig();
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(async () => {
        window.history.replaceState({}, document.title, "/")
        await User.createWithCurrentUser();
        setIsUserSigned(true)
      });
    } else if (userSession.isUserSignedIn()) {
      setPerson(new Person(userSession.loadUserData().profile))
      setUsername(userSession.loadUserData().username)
      setIsUserSigned(true)
    } else {
      setPerson(undefined)
      setUsername('')
      setIsUserSigned(false)
    }
  }, [isUserSigned])

  const setCart = (products: Array<Product>) => {
    localStorage.setItem('cart', JSON.stringify(products))
    _setCart(products)
  }

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    userSession.redirectToSignIn();
  }

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    userSession.signUserOut(window.location.origin);
  }

  return (
    <div className="site-wrapper">
      <div className="site-wrapper-inner">
        <ThemeProvider theme={theme}>
          <NavBar
            username={username}
            user={person}
            signOut={handleSignOut}
            numberOfProductsOnCart={cart.length}
          />
          {!userSession.isUserSignedIn() ?
            <Signin userSession={userSession} handleSignIn={handleSignIn} />
            :
            <div>
              <Switch>
                <Route path='/products/new'>
                  <CreateProduct />
                </Route>
                <Route
                  path='/profile/:username?'
                  render={
                    routeProps =>
                      <Profile
                        userSession={userSession}
                        handleSignOut={handleSignOut}
                        {...routeProps}
                      />
                  }
                />
                <Route path='/transactions'>
                  <Transaction product={cart[0]} />
                </Route>
                <Route path='/'>
                  <ListProducts
                    userSession={userSession}
                    cartManager={{ cart, setCart }}
                  />
                </Route>
              </Switch>
              {history.location.pathname !== '/products/new' &&
                <Fab color="primary" className={classes.addButton}>
                  <AddIcon onClick={() => history.push('/products/new')} />
                </Fab>
              }
            </div>
          }
        </ThemeProvider>
      </div>
    </div >
  );
}
