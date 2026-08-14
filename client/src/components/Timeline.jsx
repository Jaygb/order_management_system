import React from 'react';
import { Check, Clock, Truck, Home, XCircle, Utensils } from 'lucide-react';

const STATUS_INDEX = {
  RECEIVED: 0,
  PREPARING: 1,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
};

export default function Timeline({ status, isPickup }) {
  const isCancelled = status === 'CANCELLED';
  const currentStepIndex = isCancelled ? -1 : (STATUS_INDEX[status] ?? 0);

  const steps = [
    { key: 'RECEIVED', label: 'Order Received', desc: 'We have received your order and are confirming details.', icon: Clock },
    { key: 'PREPARING', label: 'Preparing Food', desc: 'Our chefs are crafting your delicious meal.', icon: Utensils },
    { key: 'OUT_FOR_DELIVERY', label: isPickup ? 'Ready for Pickup' : 'Out for Delivery', desc: isPickup ? 'Your order is ready to be picked up at the counter.' : 'Your driver is heading your way with hot food.', icon: Truck },
    { key: 'DELIVERED', label: isPickup ? 'Picked Up' : 'Delivered', desc: isPickup ? 'Thank you! Your order has been successfully picked up.' : 'Bon appétit! Your order has been delivered.', icon: Home },
  ];

  const getStepState = (index) => {
    if (isCancelled) return 'pending';
    if (status === 'DELIVERED') return 'completed';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {isCancelled && (
        <div className="glass-card animate-fade-in" style={{
          padding: '16px 20px',
          border: '1px solid hsla(var(--danger), 0.3)',
          background: 'hsla(var(--danger), 0.08)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'hsl(var(--danger))',
          fontWeight: 600,
        }}>
          <XCircle size={22} />
          <div>
            <div style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>Order Cancelled</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.85, marginTop: '2px' }}>
              This order has been cancelled and will not progress further.
            </div>
          </div>
        </div>
      )}

      <div className="timeline-container">
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const IconComponent = step.icon;

          return (
            <div key={step.key} className={`timeline-item ${state} animate-fade-in`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="timeline-dot">
                {state === 'completed' ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <IconComponent size={12} strokeWidth={2.5} />
                )}
              </div>
              <div className="timeline-title">{step.label}</div>
              <div className="timeline-desc">{step.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
