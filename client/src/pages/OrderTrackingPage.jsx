import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/api';
import Timeline from '../components/Timeline';
import {
  connectSocket,
  disconnectSocket,
  joinOrderRoom,
  leaveOrderRoom,
  subscribeToStatusUpdates,
  unsubscribeFromStatusUpdates,
} from '../services/socket';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchStarted = useRef(null);

  // 1. Fetch initial order status and info
  useEffect(() => {
    if (fetchStarted.current === id) return;
    fetchStarted.current = id;

    const fetchOrder = async () => {
      try {
        const data = await getOrder(id);
        setOrder(data);
      } catch (err) {
        console.error('[OrderTrackingPage] Failed to fetch order:', err);
        setError('Order not found. Please verify the URL or check your internet connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // 2. Set up Socket.IO subscriptions for real-time status updates
  useEffect(() => {
    if (!loading && order) {
      connectSocket();
      joinOrderRoom(id);

      subscribeToStatusUpdates((updatedOrder) => {
        if (String(updatedOrder.id) === String(id)) {
          console.log('[OrderTrackingPage] Received status transition event:', updatedOrder.status);
          setOrder(updatedOrder);
        }
      });

      // Cleanup connection on component unmount
      return () => {
        console.log('[OrderTrackingPage] Component unmounting, disconnecting socket room...');
        leaveOrderRoom(id);
        unsubscribeFromStatusUpdates();
        disconnectSocket();
      };
    }
  }, [id, loading, order === null]);

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
        <p style={{ color: 'hsl(var(--txt-muted))', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Connecting to order dispatcher...</p>
      </div>
    );
  }

  if (error || !order) {
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
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Order Not Found</h2>
        <p style={{ color: 'hsl(var(--txt-muted))', maxWidth: '400px', fontSize: '0.95rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '12px' }}>Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'hsl(var(--txt-muted))',
          fontSize: '0.95rem',
        }}>
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>
      </div>

      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '36px',
      }}>
        <div>
          <span style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-heading)',
            color: 'hsl(var(--primary))',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>Live Dispatch Tracking</span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '4px', fontWeight: 800 }}>Order {order.orderNumber}</h1>
        </div>

        <div className="glass-card" style={{
          padding: '8px 16px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          fontWeight: 700,
          background: 'rgba(255,255,255,0.02)',
        }}>
          Status: <span style={{
            color: order.status === 'CANCELLED' ? 'hsl(var(--danger))' :
                   order.status === 'DELIVERED' ? 'hsl(var(--success))' :
                   'hsl(var(--primary))',
            textTransform: 'uppercase',
          }}>{order.status.replace(/_/g, ' ')}</span>
        </div>
      </header>

      <div className="cart-layout" style={{ gridTemplateColumns: '1fr' }}>
        {/* Timeline block */}
        <section className="glass-card animate-fade-in" style={{ padding: '32px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '24px' }}>
            {order.address === 'Store Pickup' ? 'Order Progress' : 'Delivery Progress'}
          </h2>
          <Timeline status={order.status} isPickup={order.address === 'Store Pickup'} />
        </section>

        {/* Order details panel cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <section className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '12px' }}>
              {order.address === 'Store Pickup' ? 'Pickup Details' : 'Delivery Address'}
            </h3>
            <div style={{ fontSize: '0.95rem', color: 'hsl(var(--txt-muted))' }}>
              <div style={{ fontWeight: 700, color: 'hsl(var(--txt-primary))', marginBottom: '4px' }}>{order.customerName}</div>
              <div style={{ marginBottom: '4px' }}>{order.address}</div>
              <div>{order.phone}</div>
            </div>
          </section>

          <section className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '16px' }}>Basket Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'hsl(var(--txt-muted))' }}>
                    {item.quantity}x {item.menuItem?.name || 'Item'}
                  </span>
                  <span style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem' }}>
              <span>Total Paid</span>
              <span style={{ color: 'hsl(var(--primary))' }}>${order.totalAmount.toFixed(2)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
