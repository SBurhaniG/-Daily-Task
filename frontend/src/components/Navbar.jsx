import React from 'react';

function Navbar() {
  return (
    <nav className="custom-nav">
      <div className="nav-logo">MyLogo</div>
      <ul className="nav-list">
        <li>
          <a href="/" className="nav-link active-link">Home</a>
        </li>
        <li>
          <a href="/about" className="nav-link">About</a>
        </li>
        <li>
          <a href="/contact" className="nav-link">Contact</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
