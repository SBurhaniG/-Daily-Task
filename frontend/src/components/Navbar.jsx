import React from 'react';

function Navbar() {
  // Long utility styles grouped tightly at the top
  const layout = "w-full flex justify-center pt-6 px-4 font-sans";
  const navBar = "w-full max-w-4xl flex justify-between items-center bg-[#222] border border-[#333] px-8 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.4)]";
  const logo = "text-white text-xl font-bold tracking-wider hover:text-[#0070f3] cursor-pointer transition-colors duration-200";
  const linkList = "flex list-none gap-6 m-0 p-0 items-center";
  
  // Link item states
  const activeLink = "text-[#0070f3] bg-[#0070f3]/10 font-semibold px-4 py-1.5 rounded-full no-underline text-sm transition-all duration-200";
  const defaultLink = "text-gray-400 font-medium no-underline text-sm hover:text-white transition-colors duration-200";

  return (
    <div className={layout}>
      <nav className={navBar}>
        
        <div className={logo}>MyLogo</div>
        
        <ul className={linkList}>
          <li>
            <a href="/" className={activeLink}>Home</a>
          </li>
          <li>
            <a href="/about" className={defaultLink}>About</a>
          </li>
          <li>
            <a href="/contact" className={defaultLink}>Contact</a>
          </li>
        </ul>

      </nav>
    </div>
  );
}

export default Navbar;
