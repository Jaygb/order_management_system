import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--txt-dimmed))',
          border: '1px solid var(--border-color)',
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700 }}>Your cart is empty</h2>
        <p style={{ color: 'hsl(var(--txt-muted))', maxWidth: '320px', fontSize: '0.95rem' }}>
          Add some delicious items from our menu to satisfy your cravings.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '8px' }}>
          Browse Dishes
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '32px', fontWeight: 800 }} className="text-gradient">Your Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map((item) => (
            <div key={item.id} className="glass-card cart-item animate-fade-in">
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{
                  width: '90px',
                  height: '70px',
                  borderRadius: 'var(--radius-sm)',
                  objectFit: 'cover',
                }}
              />

              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', fontWeight: 700 }}>{item.name}</h3>
                <span style={{
                  color: 'hsl(var(--txt-muted))',
                  fontSize: '0.9rem',
                }}>${item.price.toFixed(2)} each</span>
              </div>

              {/* Quantity selectors */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px',
                gap: '12px',
              }}>
                <button
                  className="btn btn-icon btn-outline"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ width: '28px', height: '28px', border: 'none' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>{item.quantity}</span>
                <button
                  className="btn btn-icon btn-outline"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ width: '28px', height: '28px', border: 'none' }}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.1rem',
                minWidth: '80px',
                textAlign: 'right',
              }}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                className="btn btn-icon btn-danger-outline"
                onClick={() => removeFromCart(item.id)}
                style={{ width: '32px', height: '32px' }}
                aria-label="Remove item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              className="btn btn-danger-outline"
              onClick={clearCart}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              Clear Cart
            </button>
            <Link to="/" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Checkout Summary panel */}
        <div className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--txt-muted))', fontSize: '0.95rem' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--txt-muted))', fontSize: '0.95rem' }}>
              <span>Delivery Fee</span>
              <span style={{ color: 'hsl(var(--success))', fontWeight: 600 }}>FREE</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'hsl(var(--primary))' }}>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
