import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  const navStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    background: scrolled || !isHome
      ? 'rgba(15,25,35,0.97)'
      : 'linear-gradient(180deg, rgba(15,25,35,0.8) 0%, transparent 100%)',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
    boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#c9a84c' : 'rgba(255,255,255,0.85)',
    fontWeight: 500,
    fontSize: '15px',
    padding: '6px 0',
    borderBottom: location.pathname === path ? '2px solid #c9a84c' : '2px solid transparent',
    transition: 'all 0.2s',
    textDecoration: 'none',
  });

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: '#c9a84c',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: '#0f1923', fontFamily: 'Playfair Display, serif'
          }}>L</div>
          <span style={{ color: '#fff', fontSize: '20px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
            Lux<span style={{ color: '#c9a84c' }}>Stay</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="nav-desktop">
          <Link to="/" style={linkStyle('/')}>Home</Link>
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link to="/admin" style={linkStyle('/admin')}>Admin Dashboard</Link>
          )}
          {isAuthenticated && user?.role !== 'ADMIN' && (
            <Link to="/my-bookings" style={linkStyle('/my-bookings')}>My Bookings</Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="nav-desktop">
          {isAuthenticated ? (
            <>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Hi, {user?.name?.split(' ')[0]}
              </span>
              <button onClick={handleLogout} style={{
                background: 'transparent', color: '#c9a84c',
                border: '1.5px solid #c9a84c', padding: '8px 20px',
                borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => { e.target.style.background = '#c9a84c'; e.target.style.color = '#0f1923'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#c9a84c'; }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: 'rgba(255,255,255,0.85)', fontSize: '15px', fontWeight: 500,
                padding: '8px 20px', borderRadius: '8px', textDecoration: 'none',
                transition: 'color 0.2s',
              }}>Sign In</Link>
              <Link to="/register" style={{
                background: '#c9a84c', color: '#0f1923', fontSize: '14px',
                fontWeight: 600, padding: '9px 22px', borderRadius: '8px',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          className="nav-mobile-btn"
        >
          <div style={{ width: 24, height: 2, background: '#fff', marginBottom: 5, transition: 'all 0.3s',
            transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
          <div style={{ width: 24, height: 2, background: '#fff', marginBottom: 5, opacity: menuOpen ? 0 : 1 }} />
          <div style={{ width: 24, height: 2, background: '#fff', transition: 'all 0.3s',
            transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(15,25,35,0.98)', borderTop: '1px solid rgba(201,168,76,0.2)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <Link to="/" style={{ color: '#fff', fontSize: '16px', textDecoration: 'none' }}>Home</Link>
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link to="/admin" style={{ color: '#fff', fontSize: '16px', textDecoration: 'none' }}>Admin Dashboard</Link>
          )}
          {isAuthenticated && user?.role !== 'ADMIN' && (
            <Link to="/my-bookings" style={{ color: '#fff', fontSize: '16px', textDecoration: 'none' }}>My Bookings</Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} style={{
              background: '#c9a84c', color: '#0f1923', border: 'none',
              padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}>Sign Out</button>
          ) : (
            <>
              <Link to="/login" style={{ color: '#c9a84c', fontSize: '16px', textDecoration: 'none' }}>Sign In</Link>
              <Link to="/register" style={{
                background: '#c9a84c', color: '#0f1923', padding: '12px',
                borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                textDecoration: 'none', textAlign: 'center',
              }}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
