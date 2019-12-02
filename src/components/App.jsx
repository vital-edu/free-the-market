import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import '../styles/App.css'
import Profile from './Profile';
import Signin from './Signin';
import { UserSession } from 'blockstack';
import { appConfig } from '../assets/constants'


const userSession = new UserSession({ appConfig })

export default class App extends Component {
  handleSignIn(e) {
    e.preventDefault();
    userSession.redirectToSignIn();
  }

  handleSignOut(e) {
    e.preventDefault();
    userSession.signUserOut(window.location.origin);
  }

  render() {
    return (
      <div className="site-wrapper">
        <div className="site-wrapper-inner">
          {!userSession.isUserSignedIn() ?
            <Signin userSession={userSession} handleSignIn={this.handleSignIn} />
            :
            <Switch>
              <Route
                path='/:username?'
                render={
                  routeProps =>
                    <Profile
                      userSession={userSession}
                      handleSignOut={this.handleSignOut}
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

  componentDidMount() {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        window.history.replaceState({}, document.title, "/")
        this.setState({ userData: userData })
      });
    }
  }
}
