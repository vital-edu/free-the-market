import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/NavBar.css'

export default function NavBar(props: {
  username: string,
  user: any,
  signOut(e: React.MouseEvent): void,
}) {
  const { username, user, signOut } = props

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-blue fixed-top">
      <Link className="navbar-brand" to="/">Free the Market</Link>
      <ul className="navbar-nav mr-auto">
        <li className="nav-item">
          <Link className="nav-link" to='/'>{username}</Link>
        </li>
      </ul>
      <img
        src={user.avatarUrl() ? user.avatarUrl() : './avatar-placeholder.png'}
        className="avatar"
        width="25"
        height="25"
        alt=""
      />
      <button
        className="btn btn-primary"
        onClick={signOut}
      >Sair
      </button>

    </nav>
  )
}
