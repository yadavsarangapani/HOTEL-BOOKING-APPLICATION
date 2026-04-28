import React, { useState, useEffect } from 'react';
import { hotelApi, roomApi, bookingApi } from '../services/ApiService';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' or 'bookings'
    const [hotels, setHotels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHotelModal, setShowHotelModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [currentHotel, setCurrentHotel] = useState(null);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [hotelFormData, setHotelFormData] = useState({
        name: '',
        location: '',
        description: '',
        rating: 4.0,
        amenities: 'Free Wifi, Room Service',
        imageUrl: ''
    });
    const [roomFormData, setRoomFormData] = useState({
        roomType: 'Deluxe Room',
        pricePerNight: 1000,
        maxOccupancy: 2,
        description: '',
        imageUrl: '',
        availabilityStatus: true
    });

    useEffect(() => {
        if (activeTab === 'hotels') fetchHotels();
        else fetchBookings();
    }, [activeTab]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await hotelApi.getAll();
            setHotels(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch hotels');
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingApi.getAllAdmin();
            setBookings(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch bookings');
            setLoading(false);
        }
    };

    const cancelBookingAdmin = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await bookingApi.cancel(id);
                fetchBookings();
            } catch (err) {
                alert('Failed to cancel booking');
            }
        }
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentHotel) {
                await hotelApi.update(currentHotel.id, hotelFormData);
            } else {
                await hotelApi.create(hotelFormData);
            }
            setShowHotelModal(false);
            fetchHotels();
            resetHotelForm();
        } catch (err) {
            alert('Failed to save hotel');
        }
    };

    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRoom) {
                await roomApi.update(currentRoom.id, roomFormData);
            } else {
                await hotelApi.addRoom(currentHotel.id, roomFormData);
            }
            setShowRoomModal(false);
            fetchHotels(); // Refresh to show changes if needed, though we primarily care about rooms
            resetRoomForm();
            // Optionally refetch specific hotel details if we had a detailed view
        } catch (err) {
            alert('Failed to save room');
        }
    };

    const deleteHotel = async (id) => {
        if (window.confirm('Are you sure you want to delete this hotel? All rooms will be deleted too.')) {
            try {
                await hotelApi.delete(id);
                fetchHotels();
            } catch (err) {
                alert('Failed to delete hotel');
            }
        }
    };

    const deleteRoom = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await roomApi.delete(id);
                fetchHotels(); // Refresh
            } catch (err) {
                alert('Failed to delete room');
            }
        }
    };

    const editHotel = (hotel) => {
        setCurrentHotel(hotel);
        setHotelFormData({
            name: hotel.name,
            location: hotel.location,
            description: hotel.description,
            rating: hotel.rating,
            amenities: hotel.amenities,
            imageUrl: hotel.imageUrl
        });
        setShowHotelModal(true);
    };

    const manageRooms = async (hotel) => {
        setCurrentHotel(hotel);
        // We might want to fetch full hotel details to see all rooms
        try {
            const response = await hotelApi.getById(hotel.id);
            setCurrentHotel(response.data.data);
            setShowRoomModal(false); // Make sure room modal isn't open
        } catch (err) {
            alert('Failed to fetch rooms');
        }
    };

    const resetHotelForm = () => {
        setCurrentHotel(null);
        setHotelFormData({
            name: '',
            location: '',
            description: '',
            rating: 4.0,
            amenities: 'Free Wifi, Room Service',
            imageUrl: ''
        });
    };

    const resetRoomForm = () => {
        setCurrentRoom(null);
        setRoomFormData({
            roomType: 'Deluxe Room',
            pricePerNight: 1000,
            maxOccupancy: 2,
            description: '',
            imageUrl: '',
            availabilityStatus: true
        });
    };

    if (loading) return <div className="admin-loading">Loading Management Console...</div>;

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1>Admin Management</h1>
                    <div className="admin-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('hotels')}
                        >Hotels & Rooms</button>
                        <button 
                            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('bookings')}
                        >Manage Bookings</button>
                    </div>
                </div>
                {activeTab === 'hotels' && (
                    <button className="btn-primary" onClick={() => { resetHotelForm(); setShowHotelModal(true); }}>
                        + Add New Hotel
                    </button>
                )}
            </header>

            {error && <div className="error-banner">{error}</div>}

            {activeTab === 'hotels' ? (
                <div className="hotels-grid">
                    {hotels.map(hotel => (
                        <div key={hotel.id} className="admin-hotel-card">
                            <img src={hotel.imageUrl} alt={hotel.name} />
                            <div className="card-content">
                                <h3>{hotel.name}</h3>
                                <p className="location"><i className="fas fa-map-marker-alt"></i> {hotel.location}</p>
                                <div className="actions">
                                    <button className="btn-edit" onClick={() => editHotel(hotel)}>Edit</button>
                                    <button className="btn-rooms" onClick={() => manageRooms(hotel)}>Rooms</button>
                                    <button className="btn-delete" onClick={() => deleteHotel(hotel.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bookings-management-section">
                    <h2>All User Bookings</h2>
                    <div className="admin-bookings-list">
                        {bookings && bookings.length > 0 ? (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Guest Name</th>
                                        <th>Hotel & Room</th>
                                        <th>Check-in</th>
                                        <th>Check-out</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>#{booking.id}</td>
                                            <td>{booking.userName}</td>
                                            <td>
                                                <strong>{booking.hotelName}</strong>
                                                <div style={{fontSize: '12px', color: '#666'}}>{booking.roomType}</div>
                                            </td>
                                            <td>{booking.checkInDate}</td>
                                            <td>{booking.checkOutDate}</td>
                                            <td>
                                                <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>₹{booking.totalPrice}</td>
                                            <td>
                                                {booking.status === 'CONFIRMED' && (
                                                    <button className="btn-sm-delete" onClick={() => cancelBookingAdmin(booking.id)}>Cancel</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No bookings found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Hotel Form Modal */}
            {showHotelModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{currentHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
                        <form onSubmit={handleHotelSubmit}>
                            <div className="form-group">
                                <label>Hotel Name</label>
                                <input 
                                    type="text" 
                                    value={hotelFormData.name} 
                                    onChange={(e) => setHotelFormData({...hotelFormData, name: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    value={hotelFormData.location} 
                                    onChange={(e) => setHotelFormData({...hotelFormData, location: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    value={hotelFormData.description} 
                                    onChange={(e) => setHotelFormData({...hotelFormData, description: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input 
                                    type="text" 
                                    value={hotelFormData.imageUrl} 
                                    onChange={(e) => setHotelFormData({...hotelFormData, imageUrl: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowHotelModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Hotel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rooms Management Section (shown when a hotel is selected for rooms) */}
            {currentHotel && !showHotelModal && (
                <div className="rooms-management-section">
                    <div className="section-header">
                        <h2>Rooms for {currentHotel.name}</h2>
                        <button className="btn-secondary" onClick={() => { resetRoomForm(); setShowRoomModal(true); }}>
                            + Add Room
                        </button>
                        <button className="btn-close-section" onClick={() => setCurrentHotel(null)}>Close</button>
                    </div>
                    <div className="admin-rooms-list">
                        {currentHotel.rooms && currentHotel.rooms.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Price/Night</th>
                                        <th>Max Occ.</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentHotel.rooms.map(room => (
                                        <tr key={room.id}>
                                            <td>{room.roomType}</td>
                                            <td>担{room.pricePerNight}</td>
                                            <td>{room.maxOccupancy}</td>
                                            <td>{room.availabilityStatus ? 'Available' : 'Booked'}</td>
                                            <td>
                                                <button className="btn-sm-edit" onClick={() => {
                                                    setCurrentRoom(room);
                                                    setRoomFormData({
                                                        roomType: room.roomType,
                                                        pricePerNight: room.pricePerNight,
                                                        maxOccupancy: room.maxOccupancy,
                                                        description: room.description,
                                                        imageUrl: room.imageUrl,
                                                        availabilityStatus: room.availabilityStatus
                                                    });
                                                    setShowRoomModal(true);
                                                }}>Edit</button>
                                                <button className="btn-sm-delete" onClick={() => deleteRoom(room.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No rooms added yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Room Form Modal */}
            {showRoomModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{currentRoom ? 'Edit Room' : 'Add New Room'}</h2>
                        <form onSubmit={handleRoomSubmit}>
                            <div className="form-group">
                                <label>Room Type</label>
                                <input 
                                    type="text" 
                                    value={roomFormData.roomType} 
                                    onChange={(e) => setRoomFormData({...roomFormData, roomType: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Price Per Night</label>
                                <input 
                                    type="number" 
                                    value={roomFormData.pricePerNight} 
                                    onChange={(e) => setRoomFormData({...roomFormData, pricePerNight: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Occupancy</label>
                                <input 
                                    type="number" 
                                    value={roomFormData.maxOccupancy} 
                                    onChange={(e) => setRoomFormData({...roomFormData, maxOccupancy: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input 
                                    type="text" 
                                    value={roomFormData.imageUrl} 
                                    onChange={(e) => setRoomFormData({...roomFormData, imageUrl: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={roomFormData.availabilityStatus} 
                                    onChange={(e) => setRoomFormData({...roomFormData, availabilityStatus: e.target.checked})}
                                />
                                <label>Available</label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowRoomModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Room</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
