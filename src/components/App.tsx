import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom'
import Profile from './Profile';
import Signin from './Signin';
import { UserSession, Person } from 'blockstack';
import { appConfig, theme } from '../utils/constants'
import CreateProduct from './products/new';
import ListProducts from './products';
import NavBar from './NavBar';
import { ThemeProvider } from '@material-ui/core';
import { Product } from '../models/Product';

const userSession = new UserSession({ appConfig })

const _initializeCart = () => {
  const json = localStorage.getItem('cart')
  return json ? JSON.parse(json) : []
}

export default function App() {
  const [person, setPerson] = useState<Person>()
  const [username, setUsername] = useState<string>('')
  const [isUserSigned, setIsUserSigned] = useState(false)
  const [cart, _setCart] = useState<Array<Product>>(_initializeCart)

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.history.replaceState({}, document.title, "/")
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
            <Switch>
              <Route path='/products/new'>
                <CreateProduct userSession={userSession} />
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
              <Route path='/'>
                <ListProducts
                  userSession={userSession}
                  cartManager={{ cart, setCart }}
                />
              </Route>
            </Switch>
          }
        </ThemeProvider>
      </div>
    </div >
  );
}
