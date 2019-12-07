import React, { useState, useEffect } from 'react'
import {
  Person,
  lookupProfile,
  UserSession,
} from 'blockstack';
import { appConfig } from '../utils/constants'
import '../styles/Profile.css'

const avatarFallbackImage = '../avatar-placeholder.png'

export default function Profile(props: {
  userSession: UserSession,
  handleSignOut(e: React.MouseEvent): void,
  match: {
    params: {
      username: string,
    },
  },
}) {
  const { userSession, handleSignOut } = props
  const isLocal = props.match.params.username ? false : true

  const [person, setPerson] = useState<Person | null>()
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    if (isLocal) {
      setPerson(new Person(userSession.loadUserData().profile))
      setUsername(userSession.loadUserData().username)
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
    }
  }, [])

  return (
    userSession.isUserSignedIn() && person ?
      <div className="container">
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
                    <span id="heading-name">
                      {person.name() ? person.name() : 'Nameless Person'}
                    </span>
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
          </div>
        </div>
      </div> : null
  );
}

Profile.defaultProps = {
  userSession: new UserSession({
    appConfig,
  })
};
