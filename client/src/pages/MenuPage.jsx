import React, { useState, useEffect, useRef } from 'react';
import { getMenu } from '../services/api';
import { useCart } from '../context/CartContext';
import { Plus, Check, AlertCircle } from 'lucide-react';

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedItems, setAddedItems] = useState({});
  const { addToCart } = useCart();
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;

    const fetchMenu = async () => {
      try {
        const data = await getMenu();
        setMenu(data);
      } catch (err) {
        console.error('[MenuPage] Failed to fetch menu:', err);
        setError('Unable to load dishes. Please check that the backend server is running and database is connected.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item);
    
    // Trigger tick animation state
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'hsl(var(--primary))',
          borderRadius: '50%',
          animation: 'pulse-glow 1.5s infinite linear',
        }}></div>
        <p style={{ color: 'hsl(var(--txt-muted))', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Curating our premium menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: '16px',
        textAlign: 'center',
      }}>
        <AlertCircle size={44} style={{ color: 'hsl(var(--danger))' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>Connection Error</h2>
        <p style={{ color: 'hsl(var(--txt-muted))', maxWidth: '420px', fontSize: '0.95rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '12px' }}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '12px', fontWeight: 800 }} className="text-gradient">Premium Menu</h1>
        <p style={{ color: 'hsl(var(--txt-muted))', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover gourmet delicacies handcrafted by expert chefs, delivered fresh and hot to your doorstep.
        </p>
      </header>

      {menu.length === 0 ? (
        <div className="glass-card animate-fade-in" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'hsl(var(--txt-muted))' }}>No menu dishes loaded yet.</p>
        </div>
      ) : (
        <div className="grid-menu">
          {menu.map((item) => (
            <article key={item.id} className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              opacity: item.isAvailable ? 1 : 0.55,
              transform: 'translateY(0)',
              transition: 'var(--transition)',
            }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '62%' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {!item.isAvailable && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 12, 18, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    letterSpacing: '0.05em',
                  }}>
                    UNAVAILABLE
                  </div>
                )}
              </div>

              <div style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.3 }}>{item.name}</h3>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'hsl(var(--primary))',
                    fontSize: '1.2rem',
                  }}>${item.price.toFixed(2)}</span>
                </div>

                <p style={{
                  color: 'hsl(var(--txt-muted))',
                  fontSize: '0.9rem',
                  marginBottom: '24px',
                  lineHeight: 1.5,
                  flexGrow: 1,
                }}>{item.description}</p>

                <button
                  className="btn btn-primary"
                  disabled={!item.isAvailable}
                  onClick={() => handleAddToCart(item)}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  {addedItems[item.id] ? (
                    <>
                      <Check size={18} />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
