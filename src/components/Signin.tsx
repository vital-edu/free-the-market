import React from 'react';
import '../styles/Signin.css'
import { UserSession } from 'blockstack';

export default function Signin(props: {
  userSession: UserSession,
  handleSignIn(e: React.MouseEvent): void,
}) {
  const { handleSignIn } = props;

  return (
    <div className="intro">
      <div className="panel-landing" id="section-1">
        <h1 className="landing-heading">Free the Market</h1>
        <p>Comérico eletrônico livre e descentralizado</p>
        <button
          className="btn btn-primary btn-lg"
          id="signin-button"
          onClick={handleSignIn}
        >
          Entrar com Blockstack
        </button>
      </div>
    </div>
  );
}
