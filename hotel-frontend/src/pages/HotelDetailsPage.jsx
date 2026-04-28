import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { hotelApi, bookingApi, paymentApi } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

function RoomCard({ room, onBook, isAdmin }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', border: '1px solid var(--border)',
      overflow: 'hidden', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <img
            src={room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80'}
            alt={room.roomType}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: 'var(--navy)' }}>{room.roomType}</h3>
            <span className={`badge ${room.availabilityStatus ? 'badge-success' : 'badge-danger'}`}>
              {room.availabilityStatus ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{room.description}</p>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              👥 Max {room.maxOccupancy} guests
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display, serif' }}>
                ₹{room.pricePerNight}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}> / night</span>
            </div>
            {!isAdmin && (
              <button
                className="btn-gold"
                onClick={() => onBook(room)}
                disabled={!room.availabilityStatus}
                style={{ opacity: room.availabilityStatus ? 1 : 0.5, cursor: room.availabilityStatus ? 'pointer' : 'not-allowed' }}>
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ room, hotel, onClose, onSuccess, initialData }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    checkIn: initialData?.checkIn || today,
    checkOut: initialData?.checkOut || tomorrow,
    numGuests: initialData?.guests || 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0;

  const total = (room.pricePerNight * nights).toFixed(2);

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!form.checkIn || !form.checkOut) { setError('Please select dates'); return; }
    if (form.checkIn >= form.checkOut) { setError('Check-out must be after check-in'); return; }
    if (new Date(form.checkIn) < new Date(today)) { setError('Check-in cannot be in the past'); return; }

    setLoading(true); setError('');
    try {
      const bookingRes = await bookingApi.create({
        roomId: room.id,
        checkInDate: form.checkIn,
        checkOutDate: form.checkOut,
        numGuests: form.numGuests,
        specialRequests: form.specialRequests,
      });

      const bookingId = bookingRes.data.data.id;
      navigate(`/checkout/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '20px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '28px 32px', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Booking Room</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '22px' }}>{room.roomType}</h2>
            <p style={{ color: '#c9a84c', fontSize: '14px', marginTop: '4px' }}>{hotel.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '32px' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Check-in</label>
              <input type="date" className="form-input" min={today}
                value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Check-out</label>
              <input type="date" className="form-input" min={form.checkIn || today}
                value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Guests</label>
            <select className="form-input" value={form.numGuests}
              onChange={e => setForm({ ...form, numGuests: parseInt(e.target.value) })}>
              {Array.from({ length: room.maxOccupancy }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Special Requests (Optional)</label>
            <textarea className="form-input" rows={3} placeholder="Early check-in, dietary requirements, etc."
              value={form.specialRequests} onChange={e => setForm({ ...form, specialRequests: e.target.value })}
              style={{ resize: 'vertical' }} />
          </div>

          {/* Price Summary */}
          <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Base Price ({nights} night{nights !== 1 ? 's' : ''})</span>
              <span style={{ color: 'var(--text-primary)' }}>₹{(room.pricePerNight * nights).toFixed(2)}</span>
            </div>
            <hr className="divider" style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px' }}>Total</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: 'var(--navy)' }}>₹{total}</span>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              ⚠ Please <strong onClick={() => navigate('/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>sign in</strong> to complete your booking.
            </div>
          )}

          <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}
            onClick={handleBook} disabled={loading || nights === 0}>
            {loading ? 'Processing...' : isAuthenticated ? `Confirm Booking — ₹${total}` : 'Sign In to Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const location = useLocation();

  useEffect(() => {
    hotelApi.getById(id)
      .then(res => {
        const hotelData = res.data.data;
        setHotel(hotelData);

        // Auto-select room from query params
        const params = new URLSearchParams(location.search);
        const roomId = params.get('roomId');
        if (roomId && hotelData.rooms) {
          const room = hotelData.rooms.find(r => r.id === parseInt(roomId));
          if (room) {
            setSelectedRoom(room);
          }
        }
      })
      .catch(() => setError('Hotel not found.'))
      .finally(() => setLoading(false));
  }, [id, location.search]);

  const queryParams = new URLSearchParams(location.search);
  const initialBookingData = {
    checkIn: queryParams.get('checkIn'),
    checkOut: queryParams.get('checkOut'),
    guests: parseInt(queryParams.get('guests')) || 1
  };

  const handleBookingSuccess = () => {
    setSelectedRoom(null);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Hotel Not Found</h2>
      <button className="btn-primary" onClick={() => navigate('/')}>← Back to Hotels</button>
    </div>
  );

  const amenitiesList = hotel.amenities?.split(',').map(a => a.trim()).filter(Boolean) || [];

  return (
    <div style={{ paddingTop: '70px' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: '480px', overflow: 'hidden' }}>
        <img
          src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80'}
          alt={hotel.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,25,35,0.1) 0%, rgba(15,25,35,0.7) 100%)' }} />
        <div className="container" style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 20px', borderRadius: '100px', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', fontFamily: 'DM Sans, sans-serif' }}>
            ← All Hotels
          </button>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', color: '#fff', marginBottom: '8px' }}>{hotel.name}</h1>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>📍 {hotel.location}</span>
            <span style={{ color: '#c9a84c', fontSize: '16px' }}>★ {hotel.rating?.toFixed(1)} / 5.0</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {bookingSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '24px', fontSize: '16px' }}>
            🎉 Booking confirmed! Check your email for details.{' '}
            <strong onClick={() => navigate('/my-bookings')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>View My Bookings →</strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          {/* Left */}
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--navy)', marginBottom: '16px' }}>About This Hotel</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '16px', marginBottom: '32px' }}>{hotel.description}</p>

            {amenitiesList.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: 'var(--navy)', marginBottom: '16px' }}>Amenities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '40px' }}>
                  {amenitiesList.map((a, i) => (
                    <span key={i} style={{ background: 'var(--cream-dark)', color: 'var(--navy)', padding: '8px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: 500, border: '1px solid var(--border)' }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </>
            )}

            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--navy)', marginBottom: '24px' }}>
              Available Rooms <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>({hotel.rooms?.length || 0})</span>
            </h3>

            {(!hotel.rooms || hotel.rooms.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'var(--cream)', borderRadius: '16px' }}>
                <p>No rooms configured for this hotel yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {hotel.rooms.map(room => (
                  <RoomCard key={room.id} room={room} onBook={setSelectedRoom} isAdmin={isAdmin} />
                ))}
              </div>
            )}
          </div>

          {/* Right - Info Card */}
          <div>
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--border)', padding: '28px', position: 'sticky', top: '90px', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '40px', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--navy)' }}>
                  {hotel.rating?.toFixed(1)}
                </div>
                <div style={{ color: '#c9a84c', fontSize: '20px', margin: '4px 0' }}>{'★'.repeat(Math.round(hotel.rating || 0))}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Guest Rating</div>
              </div>
              <hr className="divider" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Location</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{hotel.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rooms</span>
                  <span style={{ fontWeight: 500 }}>{hotel.rooms?.length || 0} types</span>
                </div>
              </div>
              {!isAdmin && (
                <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}
                  onClick={() => hotel.rooms?.[0] && setSelectedRoom(hotel.rooms[0])}>
                  Book a Room
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          hotel={hotel}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleBookingSuccess}
          initialData={initialBookingData}
        />
      )}
    </div>
  );
}
