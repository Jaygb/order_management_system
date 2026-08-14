import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      gap: '20px',
      textAlign: 'center',
    }}>
      <Compass size={64} style={{ color: 'hsl(var(--primary))', animation: 'pulse-glow 2s infinite' }} />
      <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }} className="text-gradient">Lost in Orbit?</h1>
      <p style={{ color: 'hsl(var(--txt-muted))', maxWidth: '400px', fontSize: '0.95rem' }}>
        We couldn't find the page you are looking for. Let's redirect you back to some delicious options!
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '12px' }}>
        Back to Menu
      </Link>
    </div>
  );
}
