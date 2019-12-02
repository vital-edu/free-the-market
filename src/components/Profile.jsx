import React, { useState, useEffect } from 'react'
import {
  Person,
  lookupProfile,
  UserSession,
} from 'blockstack';
import NavBar from './NavBar'
import { appConfig } from '../assets/constants'
import '../styles/Profile.css'

const avatarFallbackImage = './avatar-placeholder.png'

export default function Profile(props) {
  const { userSession, handleSignOut } = props
  const isLocal = props.match.params.username ? false : true

  const [statuses, setStatuses] = useState([])
  const [person, setPerson] = useState({
    name: () => 'Anonymous',
    avatarUrl: () => avatarFallbackImage
  })
  const [username, setUsername] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setPerson(new Person(userSession.loadUserData().profile))
    setUsername(userSession.loadUserData().username)
  }, [userSession])

  useEffect(() => {
    setIsLoading(true)
    if (isLocal) {
      const options = { decrypt: false }
      userSession.getFile('statuses.json', options)
        .then((file) => {
          var statuses = JSON.parse(file || '[]')
          setPerson(new Person(userSession.loadUserData().profile))
          setUsername(userSession.loadUserData().username)
          setStatuses(statuses)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      const username = props.match.params.username

      lookupProfile(username)
        .then((profile) => {
          setPerson(new Person(profile))
          setUsername(username)
        })
        .catch((error) => {
          console.log('could not resolve profile')
        })

      const options = { username: username, decrypt: false }
      userSession.getFile('statuses.json', options)
        .then((file) => {
          var statuses = JSON.parse(file || '[]')
          setStatuses(statuses)
        })
        .catch((error) => {
          console.log('could not fetch statuses')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isLocal, props.match.params.username, userSession])

  const handleNewStatusSubmit = (event) => {
    saveNewStatus(newStatus)
    setNewStatus('')
  }

  const handleNewStatusChange = (event) => {
    setNewStatus(event.target.value)
  }

  const saveNewStatus = (statusText) => {
    let status = {
      id: statuses.length + 1,
      text: statusText.trim(),
      created_at: Date.now()
    }

    statuses.unshift(status)
    const options = { encrypt: false }
    userSession.putFile('statuses.json', JSON.stringify(statuses), options)
      .then(() => setStatuses(statuses))
  }

  return (
    !userSession.isSignInPending() && person ?
      <div className="container">
        <NavBar username={username} user={person} signOut={handleSignOut} />
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
                    <span id="heading-name">{person.name ? person.name
                      : 'Nameless Person'}</span>
                  </h1>
                  <span>{username}</span>
                  {isLocal &&
                    <span>
                      &nbsp;|&nbsp;
                    <button
                        className="link-button"
                        onClick={handleSignOut} >
                        (Sair)
                    </button>
                    </span>
                  }
                </div>
              </div>
            </div>
            {isLocal &&
              <div className="new-status">
                <div className="col-md-12">
                  <textarea className="input-status"
                    value={newStatus}
                    onChange={e => handleNewStatusChange(e)}
                    placeholder="What's on your mind?"
                  />
                </div>
                <div className="col-md-12 text-right">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => handleNewStatusSubmit(e)}
                  >
                    Submit
                </button>
                </div>
              </div>
            }
            <div className="col-md-12 statuses">
              {isLoading && <span>Loading...</span>}
              {statuses.map((status) => (
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

Profile.defaultProps = {
  userSession: new UserSession(appConfig)
};
