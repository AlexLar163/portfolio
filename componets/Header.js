import userPhoto from '../assets/images/user.png';
import gitIcon from '../assets/images/git.svg';
import linkedinIcon from '../assets/images/linkedin.svg';
import nerdEmoji from '../assets/emojis/nerd.png';
// import React, { useEffect, useRef } from 'react';
// import Typed from 'typed.js'
import MyTyped from './TypedText';


const Header = () => {



  // // Create reference to store the DOM element containing the animation
  // const el = useRef(null);
  // // Create reference to store the Typed instance itself
  // const typed = useRef(null);

  // useEffect(() => {
  //   const options = {
  //     strings: [
  //       'Some <i>strings</i> are slanted',
  //       'Some <strong>strings</strong> are bold',
  //       'HTML characters &times; &copy;'
  //     ],
  //     typeSpeed: 50,
  //     backSpeed: 50,
  //   };

  //   // elRef refers to the <span> rendered below
  //   typed.current = new Typed(el.current, options);

  //   return () => {
  //     // Make sure to destroy Typed instance during cleanup
  //     // to prevent memory leaks
  //     typed.current.destroy();
  //   }
  // }, [])



  return (
    <header className="header">
      <div className="perfil">
        <img
          className="img--perfil"
          src={userPhoto}
          alt="Mi foto"
        />
        <div className="presentation--perfil">
          <h1 className="greetings--perfil" >
            ¡HOLA! Soy <span>Alex Largo</span>.
            <img className="emoji--perfil" src={nerdEmoji} alt="nerd.png" />
          </h1>
          <h2 className="presentationText--perfil">
            Soy <span>Desarrollador Frontend Junior</span>, enfocado en tecnologias basadas en <span>JavaScript</span></h2>
        </div>
        <span className="skill--perfil">
          <MyTyped />
        </span>
        <button style={{ padding: '10px' }} onDragEnter={() => console.log('aaaaaaa')}>Contactame</button>
      </div>
      <nav className="networks">
        <a className="icon--networks" target='_blank' href="https://www.linkedin.com/in/alex-largo-05324a1a2/">
          <img
            className="icon-networks"
            src={linkedinIcon}
            alt="linkedin.png"
          />
        </a>
        <a className="icon--networks" target='_blank' href="https://github.com/AlexLar163">
          <img
            className="icon-networks"
            src={gitIcon}
            alt="git.png"
          />
        </a>
      </nav>
    </header>
  )
};

export default Header;
