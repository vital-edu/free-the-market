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
import { configure, getConfig, User } from '@vital-edu/radiks'
import CreateTransaction from './transactions/new'
import ShowTransaction from './transactions/show'
import { useHistory } from "react-router"
import ListTransactions from './transactions'
import LoadingDialog from './LoadingDialog'

const userSession = new UserSession({ appConfig })

configure({
  apiServer: process.env.REACT_APP_RADIKS_SERVER as string,
  userSession
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addButton: {
      position: 'fixed',
      right: 15,
      bottom: 15,
    }
  }),
);

export default function App() {
  const classes = useStyles();
  const history = useHistory()
  const { userSession } = getConfig();

  const [person, setPerson] = useState<Person | null>(null)
  const [username, setUsername] = useState<string>('')
  const [isUserSigned, setIsUserSigned] = useState(false)
  const [cart, _setCart] = useState<Array<Product>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTitle, setLoadingTitle] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingProgressShouldBe, setLoadingProgressShouldBe] = useState(0)

  useEffect(() => {
    if (userSession.isSignInPending()) {
      console.log('pending')
      userSession.handlePendingSignIn().then(async () => {
        window.history.replaceState({}, document.title, "/")
        setIsLoading(true)
        setLoadingTitle('Registrando sessão do usuário')
        await User.createWithCurrentUser();
        setLoadingProgressShouldBe(100)
      });
    }
  }, [userSession])

  useEffect(() => {
    if (isUserSigned && person) return

    if (userSession.isUserSignedIn()) {
      setPerson(new Person(userSession.loadUserData().profile))
      setUsername(userSession.loadUserData().username)
      setIsUserSigned(true)
    }
  }, [userSession, isUserSigned, person])

  useEffect(() => {
    if (!isLoading) return
    let loadingTimer

    if (loadingProgress >= 100) {
      setIsLoading(false)
      setLoadingProgress(0)
    } else if (loadingProgress < loadingProgressShouldBe) {
      loadingTimer = setTimeout(() => {
        setLoadingProgress(loadingProgress + 1)
      }, 1)
    } else {
      loadingTimer = setTimeout(() => {
        setLoadingProgress(loadingProgress + 1)
      }, 250)
    }

    return () => clearInterval(loadingTimer)
  }, [isLoading, loadingProgress, loadingProgressShouldBe])

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
      {isLoading && <LoadingDialog
        title={loadingTitle}
        loadingProgress={loadingProgress}
      />}
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
                <Route path='/transactions/new'>
                  <CreateTransaction product={cart[0]} />
                </Route>
                <Route path='/transactions/:id' render={
                  routeProps => <ShowTransaction {...routeProps} />
                } />
                <Route path='/transactions/'>
                  <ListTransactions />
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
