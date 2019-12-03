import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom'
import '../styles/App.css'
import Profile from './Profile';
import Signin from './Signin';
import { UserSession, Person } from 'blockstack';
import { appConfig } from '../utils/constants'
import CreateProduct from './products/new';
import ListProducts from './products';
import NavBar from './NavBar';

const userSession = new UserSession({ appConfig })

export default function App() {
  const [person, setPerson] = useState<Person>()
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.history.replaceState({}, document.title, "/")
      });
    }
  })

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setPerson(new Person(userSession.loadUserData().profile))
      setUsername(userSession.loadUserData().username)
    } else {
      setPerson(undefined)
      setUsername('')
    }
  }, [userSession])

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
      <NavBar username={username} user={person} signOut={handleSignOut} />
      <div className="site-wrapper-inner">
        {!userSession.isUserSignedIn() ?
          <Signin userSession={userSession} handleSignIn={handleSignIn} />
          :
          <Switch>
            <Route path='/products/new'>
              <CreateProduct userSession={userSession} />
            </Route>
            <Route path='/products'>
              <ListProducts userSession={userSession} />
            </Route>
            <Route
              path='/:username?'
              render={
                routeProps =>
                  <Profile
                    userSession={userSession}
                    handleSignOut={handleSignOut}
                    {...routeProps}
                  />
              }
            />
          </Switch>
        }
      </div>
    </div >
  );
}
