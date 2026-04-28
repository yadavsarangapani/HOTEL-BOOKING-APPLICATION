import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingApi, paymentApi } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  CONFIRMED: { label: 'Confirmed', color: '#27ae60', bg: '#e8f5ee', icon: '✓' },
  CANCELLED: { label: 'Cancelled', color: '#c0392b', bg: '#fdecea', icon: '✕' },
  PENDING_PAYMENT: { label: 'Payment Needed', color: '#d4880a', bg: '#fef9ec', icon: '◷' },
  REFUND_REQUESTED: { label: 'Refund Requested', color: '#8e44ad', bg: '#f4ecf7', icon: '⏳' },
  REFUNDED: { label: 'Refunded', color: '#2980b9', bg: '#eaf2f8', icon: '↩' },
  PENDING: { label: 'Pending', color: '#aaa', bg: '#f5f5f5', icon: '…' },
};

function BookingCard({ booking, onCancel, cancelling }) {
  const navigate = useNavigate();
  const status = statusConfig[booking.status] || statusConfig.PENDING;
  const checkInDate = new Date(booking.checkInDate);
  checkInDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isPast = checkInDate < today;
  const isToday = checkInDate.getTime() === today.getTime();
  const nights = Math.round((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 86400000);
  const canCancelOrRefund = (booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT') && !isPast;

  return (
    <div style={{
      background: '#fff', borderRadius: '20px', border: '1px solid var(--border)',
      overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>

      {/* Top Bar */}
      <div style={{ background: 'var(--navy)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '0.05em' }}>BOOKING #</span>
          <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: '15px', marginLeft: '6px' }}>{booking.id}</span>
        </div>
        <span style={{ background: status.bg, color: status.color, padding: '4px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}>
          {status.icon} {status.label}
        </span>
      </div>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '24px', alignItems: 'start' }}>
        {/* Room Image */}
        <div style={{ width: '120px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={booking.roomImageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'}
            alt={booking.roomType}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Details */}
        <div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--navy)', marginBottom: '4px' }}>
            {booking.roomType}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
            📍 {booking.hotelName} · {booking.hotelLocation}
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Check-in</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{booking.checkInDate}</div>
            </div>
            <div style={{ color: 'var(--border)', display: 'flex', alignItems: 'center' }}>→</div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Check-out</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{booking.checkOutDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Duration</div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>{nights} night{nights !== 1 ? 's' : ''}</div>
            </div>
            {booking.numGuests && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Guests</div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{booking.numGuests}</div>
              </div>
            )}
          </div>
          {booking.specialRequests && (
            <div style={{ marginTop: '12px', background: 'var(--cream)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', borderLeft: '3px solid #c9a84c' }}>
              <strong>Special Requests:</strong> {booking.specialRequests}
            </div>
          )}
        </div>

        {/* Price + Actions */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Total Paid</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: 700, color: 'var(--navy)' }}>
              ₹{parseFloat(booking.totalPrice).toFixed(2)}
            </div>
          </div>
          <button className="btn-outline" style={{ fontSize: '13px', padding: '8px 16px' }}
            onClick={() => navigate(`/hotels/${booking.hotelId}`)}>
            View Hotel
          </button>
          {canCancelOrRefund && (
            <button className="btn-danger" onClick={() => onCancel(booking.id, booking.status)} disabled={cancelling === booking.id} style={{ fontSize: '13px', padding: '8px 16px' }}>
              {cancelling === booking.id ? 'Processing...' : 'Cancel Booking'}
            </button>
          )}
          {booking.status === 'PENDING_PAYMENT' && (
            <button className="btn-gold" style={{ fontSize: '13px', padding: '8px 16px' }}
              onClick={() => navigate(`/checkout/${booking.id}`)}>
              Complete Payment
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 24px', background: 'var(--cream)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Booked on {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
        <span>{isPast && booking.status !== 'CANCELLED' ? '✓ Completed' : !canCancelOrRefund && !['CANCELLED', 'REFUND_REQUESTED', 'REFUNDED'].includes(booking.status) ? 'Non-refundable' : ''}</span>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data.data || []);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    const initialize = async () => {
      if (location.state?.paymentSuccess) {
        setAlert({ type: 'success', msg: '✓ Payment successful! Your reservation is now officially confirmed. A confirmation email has been sent to your inbox.' });
        // Clear state to prevent alert from reappearing on refresh
        window.history.replaceState({}, document.title);
      } else if (paymentStatus === 'success' && sessionId) {
        setAlert({ type: 'success', msg: 'Checking payment status... Page will update shortly.' });
        try {
          await paymentApi.verifyPayment(sessionId);
          setAlert({ type: 'success', msg: '✓ Your payment was successful! Your booking is now confirmed.' });
        } catch {
          setAlert({ type: 'danger', msg: '⚠ Payment verification failed. Please contact us if you were charged.' });
        }
      }
      fetchBookings();
    };

    initialize();
  }, [fetchBookings, location.search, location.state]);

  const handleCancel = async (id, status) => {
    const isRefund = status === 'CONFIRMED';
    let confirmMsg = 'Are you sure you want to cancel this booking?';

    if (isRefund) {
      confirmMsg = `⚠️ CANCELLATION RULES:
1. This booking is already paid. Cancellation will initiate a REFUND REQUEST.
2. Refund requests require manual approval by our Admin team.
3. The original payment method will be used for the refund.
4. It may take 3-5 business days to reflect in your account.

Do you want to PROCEED for Request Refund?`;
    }

    if (!window.confirm(confirmMsg)) return;

    setCancelling(id);
    try {
      const res = await bookingApi.cancel(id);
      setAlert({ type: 'success', msg: res.data.message });
      fetchBookings();
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Processing failed.' });
    } finally {
      setCancelling(null);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    totalSpent: bookings.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0),
  };

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy), #1a2a3a)', padding: '48px 0' }}>
        <div className="container">
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Account</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', color: '#fff', marginBottom: '8px' }}>
            My <span style={{ color: '#c9a84c' }}>Bookings</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>Welcome back, {user?.name}. Manage all your reservations here.</p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '32px', flexWrap: 'wrap' }}>
            {[
              [`${stats.total}`, 'Total Bookings'],
              [`${stats.confirmed}`, 'Confirmed'],
              [`${stats.cancelled}`, 'Cancelled'],
              [`₹${stats.totalSpent.toFixed(0)}`, 'Total Spent'],
            ].map(([val, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '16px 24px' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#c9a84c', fontWeight: 600 }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: '24px' }}>
            {alert.type === 'success' ? '✓' : '⚠'} {alert.msg}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {['ALL', 'CONFIRMED', 'CANCELLED'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
              background: filter === f ? 'var(--navy)' : '#fff',
              color: filter === f ? '#c9a84c' : 'var(--text-secondary)',
              border: filter === f ? '2px solid var(--navy)' : '2px solid var(--border)',
            }}>
              {f === 'ALL' ? `All (${stats.total})` : f === 'CONFIRMED' ? `Confirmed (${stats.confirmed})` : `Cancelled (${stats.cancelled})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏨</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--navy)', marginBottom: '12px' }}>
              {filter === 'ALL' ? 'No Bookings Yet' : `No ${filter.toLowerCase()} bookings`}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
              {filter === 'ALL' ? 'Start exploring our curated collection of luxury hotels.' : 'Try viewing all bookings.'}
            </p>
            {filter === 'ALL' ? (
              <button className="btn-gold" onClick={() => navigate('/')}>Explore Hotels →</button>
            ) : (
              <button className="btn-outline" onClick={() => setFilter('ALL')}>View All Bookings</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filtered.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
