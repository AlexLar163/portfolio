import React, { useEffect, useRef } from "react";
import Typed from 'typed.js'

const TypedText = () => {
  const el = React.useRef(null);
  const typed = React.useRef(null);
  React.useEffect(() => {
    const options = {
      strings: [
        'React',
        'Angular',
        'Vue'
      ],
      smartBackspace: false,
      startDelay: 1000,
      typeSpeed: 100,
      backSpeed: 50,
      loop: true,
      shuffle: false,
      backDelay: 1500,
    };
    typed.current = new Typed(el.current, options);
    return () => {
      typed.current.destroy();
    }
  }, [])
  return (
    <div className="wrap">
      <div className="type-wrap">
        <span style={{ whiteSpace: 'pre' }} ref={el} />
      </div>
    </div>
  );
}

export default TypedText;