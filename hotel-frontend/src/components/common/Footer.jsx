import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--navy)',
      color: 'rgba(255,255,255,0.7)',
      paddingTop: '60px',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '48px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: 36, height: 36, background: '#c9a84c', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 700, color: '#0f1923', fontFamily: 'Playfair Display, serif'
              }}>L</div>
              <span style={{ color: '#fff', fontSize: '20px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                Lux<span style={{ color: '#c9a84c' }}>Stay</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
              Curated luxury accommodations for the discerning traveller.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['/', 'Home'], ['/my-bookings', 'My Bookings'], ['/login', 'Sign In'], ['/register', 'Register']].map(([path, label]) => (
                <Link key={path} to={path} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#c9a84c'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              <span>support@luxstay.com</span>
              <span>+1 (800) 123-4567</span>
              <span>Available 24/7</span>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: '#c9a84c', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Newsletter</h4>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>Get exclusive offers in your inbox.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input placeholder="Your email" style={{
                flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px',
                color: '#fff', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none',
              }} />
              <button style={{
                background: '#c9a84c', color: '#0f1923', border: 'none',
                padding: '10px 16px', borderRadius: '8px', fontWeight: 600,
                cursor: 'pointer', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
              }}>→</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2024 LuxStay Hotels. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <span key={item} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
