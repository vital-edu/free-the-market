import React, { Component } from 'react'
import {
  Person,
  lookupProfile,
  UserSession,
} from 'blockstack';
import NavBar from './NavBar'
import { appConfig } from '../assets/constants'
import '../styles/Profile.css'

const avatarFallbackImage = './avatar-placeholder.png'

export default class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      person: {
        name() {
          return 'Anonymous'
        },
        avatarUrl() {
          return avatarFallbackImage
        },
      },
      username: '',
      newStatus: '',
      statuses: [],
      statusIndex: 0,
      isLoading: false,
    }
  }

  isLocal() {
    return this.props.match.params.username ? false : true
  }

  componentWillMount() {
    const { userSession } = this.props
    this.setState({
      person: new Person(userSession.loadUserData().profile),
      username: userSession.loadUserData().username
    });
  }

  componentDidMount() {
    this.fetchData()
  }

  handleNewStatusChange(event) {
    this.setState({ newStatus: event.target.value })
  }

  handleNewStatusSubmit(event) {
    this.saveNewStatus(this.state.newStatus)
    this.setState({
      newStatus: ""
    })
  }

  saveNewStatus(statusText) {
    const { userSession } = this.props
    let statuses = this.state.statuses

    let status = {
      id: this.state.statusIndex++,
      text: statusText.trim(),
      created_at: Date.now()
    }

    statuses.unshift(status)
    const options = { encrypt: false }
    userSession.putFile('statuses.json', JSON.stringify(statuses), options)
      .then(() => {
        this.setState({
          statuses: statuses
        })
      })
  }

  fetchData() {
    const { userSession } = this.props
    this.setState({ isLoading: true })
    if (this.isLocal()) {
      const options = { decrypt: false }
      userSession.getFile('statuses.json', options)
        .then((file) => {
          var statuses = JSON.parse(file || '[]')
          this.setState({
            person: new Person(userSession.loadUserData().profile),
            username: userSession.loadUserData().username,
            statusIndex: statuses.length,
            statuses: statuses,
          })
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    } else {
      const username = this.props.match.params.username

      lookupProfile(username)
        .then((profile) => {
          this.setState({
            person: new Person(profile),
            username: username
          })
        })
        .catch((error) => {
          console.log('could not resolve profile')
        })

      const options = { username: username, decrypt: false }
      userSession.getFile('statuses.json', options)
        .then((file) => {
          var statuses = JSON.parse(file || '[]')
          this.setState({
            statusIndex: statuses.length,
            statuses: statuses
          })
        })
        .catch((error) => {
          console.log('could not fetch statuses')
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    }
  }

  render() {
    const { handleSignOut, userSession } = this.props;
    const { person } = this.state;
    const { username } = this.state;

    return (
      !userSession.isSignInPending() && person ?
        <div className="container">
          <NavBar username={username} user={person} signOut={this.props.handleSignOut} />
          <div className="row">
            <div className="col-md-offset-3 col-md-6">
              <div className="col-md-12">
                <div className="avatar-section">
                  <img
                    src={person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage}
                    className="img-rounded avatar"
                    id="avatar-image"
                    alt="foto de perfil"
                  />
                  <div className="username">
                    <h1>
                      <span id="heading-name">{person.name() ? person.name()
                        : 'Nameless Person'}</span>
                    </h1>
                    <span>{username}</span>
                    {this.isLocal() &&
                      <span>
                        &nbsp;|&nbsp;
                      <a onClick={handleSignOut.bind(this)}>(Logout)</a>
                      </span>
                    }
                  </div>
                </div>
              </div>
              {this.isLocal() &&
                <div className="new-status">
                  <div className="col-md-12">
                    <textarea className="input-status"
                      value={this.state.newStatus}
                      onChange={e => this.handleNewStatusChange(e)}
                      placeholder="What's on your mind?"
                    />
                  </div>
                  <div className="col-md-12 text-right">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={e => this.handleNewStatusSubmit(e)}
                    >
                      Submit
                  </button>
                  </div>
                </div>
              }
              <div className="col-md-12 statuses">
                {this.state.isLoading && <span>Loading...</span>}
                {this.state.statuses.map((status) => (
                  <div className="status" key={status.id}>
                    {status.text}
                  </div>
                )
                )}
              </div>
            </div>
          </div>
        </div> : null
    );
  }

}

Profile.defaultProps = {
  userSession: new UserSession(appConfig)
};
