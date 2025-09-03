import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ links = [], userEmail = '', onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="w-full fixed top-0 left-0 z-50 shadow-lg" style={{ background: 'linear-gradient(90deg,#050d07 80%,#0f0f0f 100%)', borderBottom: '2px solid #00ff41', boxShadow: '0 0 24px #00ff41' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
        <div className="font-bold text-2xl text-[#00ff41] tracking-widest drop-shadow-glow animate-pulse">NextQA</div>
        <div className="hidden md:flex items-center space-x-2">
          {links.map(link => (
            <Link key={link.path} to={link.path} className="px-5 py-2 rounded bg-[#050d07] text-[#00ff41] font-mono font-semibold shadow hover:bg-[#00ff41] hover:text-black transition-all duration-150 border border-[#00ff41] mx-1 text-lg drop-shadow-glow">
              {link.label}
            </Link>
          ))}
          <button onClick={onLogout} className="px-5 py-2 rounded bg-[#050d07] text-[#00ff41] font-mono font-semibold shadow hover:bg-red-600 hover:text-white transition-all duration-150 border border-[#00ff41] mx-1 text-lg drop-shadow-glow">Cerrar sesión</button>
          {userEmail && <span className="ml-4 px-5 py-2 rounded bg-[#00ff41] text-black font-mono font-semibold shadow border border-[#00ff41] text-lg drop-shadow-glow">{userEmail}</span>}
        </div>
        <div className="md:hidden flex items-center">
          {userEmail && <span className="mr-2 px-5 py-2 rounded bg-[#00ff41] text-black font-mono font-semibold shadow border border-[#00ff41] text-lg drop-shadow-glow">{userEmail}</span>}
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none ml-2">
            <span className="block w-12 h-12 rounded-full bg-[#050d07] border-2 border-[#00ff41] flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-8 h-8 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </span>
          </button>
        </div>
      </div>
      {/* Menú móvil/tablet */}
      {menuOpen && (
        <div className="md:hidden w-full bg-[#050d07] flex flex-col items-center py-6 border-t border-[#00ff41] shadow-lg animate-fade-in">
          {links.map(link => (
            <Link key={link.path} to={link.path} className="px-5 py-2 rounded bg-[#050d07] text-[#00ff41] font-mono font-semibold shadow hover:bg-[#00ff41] hover:text-black transition-all duration-150 border border-[#00ff41] my-2 w-3/4 text-center text-lg drop-shadow-glow" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <button onClick={onLogout} className="mt-4 px-5 py-2 rounded bg-[#050d07] text-[#00ff41] font-mono font-semibold shadow hover:bg-red-600 hover:text-white transition-all duration-150 border border-[#00ff41] w-3/4 text-lg drop-shadow-glow">Cerrar sesión</button>
        </div>
      )}
    </nav>
  );
}
