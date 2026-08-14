import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Compass } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="glass-card" style={{
      position: 'sticky',
      top: '16px',
      zIndex: 100,
      margin: '16px 24px 32px 24px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px',
        padding: '0 16px',
      }}>
        <Link to="/" style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '1.4rem',
          letterSpacing: '-0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.15rem',
            boxShadow: '0 4px 10px hsla(var(--primary), 0.3)',
          }}>B</span>
          <span className="text-gradient" style={{ fontWeight: 800 }}>BiteDash</span>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--txt-muted))',
              transition: 'var(--transition)',
            })}
          >
            <Compass size={18} />
            <span>Menu</span>
          </NavLink>

          <NavLink
            to="/cart"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--txt-muted))',
              position: 'relative',
              transition: 'var(--transition)',
            })}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="badge" style={{
                position: 'absolute',
                top: '-8px',
                right: '-14px',
                animation: 'pulse-glow 2s infinite',
              }}>{itemCount}</span>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
