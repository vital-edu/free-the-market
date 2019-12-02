import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom'
import '../styles/App.css'
import Profile from './Profile';
import Signin from './Signin';
import { UserSession } from 'blockstack';
import { appConfig } from '../utils/constants'

const userSession = new UserSession({ appConfig })

export default function App() {
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.history.replaceState({}, document.title, "/")
      });
    }
  })

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
        {!userSession.isUserSignedIn() ?
          <Signin userSession={userSession} handleSignIn={handleSignIn} />
          :
          <Switch>
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
    </div>
  );
}
