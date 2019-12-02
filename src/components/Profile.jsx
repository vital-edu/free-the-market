import React, { Component } from 'react'
import { UserSession, Person } from 'blockstack'
import NavBar from './NavBar'
import { appConfig } from '../assets/constants'
import '../styles/Profile.css'

export default class Profile extends Component {
  render() {
    const username = this.props.userSession.loadUserData().username;
    const profile = this.props.userSession.loadUserData();
    const person = new Person(profile);
    return (
      <div className="Dashboard">
        <NavBar username={username} user={person} signOut={this.props.handleSignOut} />
        <div className="row justify-content-center" id="header">
          <h3 className="user-info">
            {username}
          </h3>
        </div>
        <br></br>
        <div className="row justify-content-center">
        </div>
        <br></br>
        <div className="row justify-content-center">
        </div>
      </div>
    );
  }

}

Profile.defaultProps = {
  userSession: new UserSession(appConfig)
};
