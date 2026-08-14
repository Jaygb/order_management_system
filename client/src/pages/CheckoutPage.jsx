import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import { z } from 'zod';
import { CreditCard, MapPin, Phone, User, ArrowLeft } from 'lucide-react';

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

// Matches backend validation constraints
const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters long').max(255, 'Address cannot exceed 255 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters long').regex(phoneRegex, 'Invalid phone number format'),
});

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(() => {
    try {
      const stored = localStorage.getItem('bitedash_last_delivery');
      const lastDetails = stored ? JSON.parse(stored) : {};
      return {
        customerName: lastDetails.customerName || '',
        address: lastDetails.address === 'Store Pickup' ? '' : (lastDetails.address || ''),
        phone: lastDetails.phone || '',
      };
    } catch (e) {
      console.error('[CheckoutPage] Failed to parse last delivery details:', e);
      return { customerName: '', address: '', phone: '' };
    }
  });

  const [requestDelivery, setRequestDelivery] = useState(true);
  const [savedAddress, setSavedAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState(null);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>No items to check out</h2>
        <p style={{ color: 'hsl(var(--txt-muted))', margin: '16px 0' }}>Add dishes to your cart before proceeding.</p>
        <Link to="/" className="btn btn-primary">Go to Menu</Link>
      </div>
    );
  }

  const handleDeliveryToggle = (checked) => {
    setRequestDelivery(checked);
    if (!checked) {
      setSavedAddress(formData.address);
      setFormData((prev) => ({ ...prev, address: 'Store Pickup' }));
      if (errors.address) {
        setErrors((prev) => ({ ...prev, address: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, address: savedAddress === 'Store Pickup' ? '' : savedAddress }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setBackendError(null);

    // 1. Frontend validation with Zod
    try {
      checkoutSchema.parse(formData);
    } catch (zodError) {
      const fieldErrors = {};
      zodError.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // 2. Prepare payload
    const orderItems = cart.map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity,
    }));

    const payload = {
      customerName: formData.customerName,
      address: formData.address,
      phone: formData.phone,
      items: orderItems,
    };

    // 3. Submit
    try {
      const order = await placeOrder(payload);
      
      // Save last delivery details to localStorage
      try {
        const stored = localStorage.getItem('bitedash_last_delivery');
        const lastDetails = stored ? JSON.parse(stored) : {};
        const lastDeliveryDetails = {
          customerName: formData.customerName,
          address: requestDelivery ? formData.address : (lastDetails.address || ''),
          phone: formData.phone,
        };
        localStorage.setItem('bitedash_last_delivery', JSON.stringify(lastDeliveryDetails));
      } catch (storageErr) {
        console.error('[CheckoutPage] Failed to save last delivery details:', storageErr);
      }

      clearCart();
      navigate(`/order-tracking/${order.id}`);
    } catch (err) {
      console.error('[CheckoutPage] Order submission failed:', err);
      // Extract backend validation messages
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setBackendError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/cart" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'hsl(var(--txt-muted))',
          fontSize: '0.95rem',
        }}>
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </Link>
      </div>

      <h1 style={{ fontSize: '2.2rem', marginBottom: '32px', fontWeight: 800 }} className="text-gradient">Delivery & Checkout</h1>

      <div className="cart-layout" style={{ gridTemplateColumns: '1fr' }}>
        {/* Checkout details Form */}
        <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '8px' }}>Delivery Details</h2>

          {backendError && (
            <div style={{
              background: 'hsla(var(--danger), 0.08)',
              border: '1px solid hsla(var(--danger), 0.3)',
              color: 'hsl(var(--danger))',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              {backendError}
            </div>
          )}

          {/* Delivery Option Toggle Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }} onClick={() => handleDeliveryToggle(!requestDelivery)}>
            <input
              type="checkbox"
              id="requestDelivery"
              checked={requestDelivery}
              onChange={(e) => handleDeliveryToggle(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'hsl(var(--primary))',
                cursor: 'pointer',
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor="requestDelivery" style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              <span>Home Delivery (Free)</span>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--txt-muted))', fontWeight: 400 }}>
                {requestDelivery ? 'We will deliver to your address' : 'Self pickup from our store'}
              </span>
            </label>
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="customerName" className="form-label">
              <User size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Full Name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-input"
              disabled={isSubmitting}
            />
            {errors.customerName && <span className="form-error">{errors.customerName}</span>}
          </div>

          {/* Address Field */}
          {requestDelivery && (
            <div className="form-group animate-fade-in">
              <label htmlFor="address" className="form-label">
                <MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Delivery Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address === 'Store Pickup' ? '' : formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Apt 4B"
                className="form-input"
                disabled={isSubmitting}
              />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>
          )}

          {/* Phone Field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 019-2834"
              className="form-input"
              disabled={isSubmitting}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '12px', padding: '14px' }}>
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'pulse-glow 1s infinite linear',
                }}></span>
                Placing Order...
              </span>
            ) : (
              <>
                <CreditCard size={18} />
                <span>Place Order (${subtotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
