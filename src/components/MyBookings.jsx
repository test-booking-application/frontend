import { useState, useEffect } from 'react'
import axios from 'axios'
import './MyBookings.css'

function MyBookings({ user }) {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [user])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/bookings', {
                params: { userId: user.id }
            })
            setBookings(response.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching bookings')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return
        }

        try {
            await axios.delete(`/api/bookings/${bookingId}`)
            setBookings(bookings.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
            ))
        } catch (err) {
            alert(err.response?.data?.error || 'Error cancelling booking')
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <div className="loading-text">Loading your bookings...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container">
                <div className="error" style={{ maxWidth: '600px', margin: '40px auto' }}>
                    {error}
                </div>
            </div>
        )
    }

    return (
        <section className="bookings-section">
            <div className="container">
                <h2 className="section-title">My Bookings</h2>

                {bookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎫</div>
                        <h3>No bookings yet</h3>
                        <p>Start exploring events and book your first ticket!</p>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card card">
                                <div className="booking-header">
                                    <div className="booking-reference">
                                        <span className="reference-label">Booking ID</span>
                                        <span className="reference-value">{booking.bookingReference}</span>
                                    </div>
                                    <span className={`booking-status badge ${booking.status === 'confirmed' ? 'badge-success' :
                                            booking.status === 'cancelled' ? 'badge-warning' : 'badge-info'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <h3 className="booking-event-name">{booking.eventName}</h3>

                                <div className="booking-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span className="detail-text">{booking.venue}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <span className="detail-text">{formatDate(booking.eventDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🕐</span>
                                        <span className="detail-text">{booking.eventTime}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🎫</span>
                                        <span className="detail-text">{booking.quantity} ticket(s)</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">💵</span>
                                        <span className="detail-text">{formatPrice(booking.totalPrice)}</span>
                                    </div>
                                </div>

                                <div className="booking-footer">
                                    <div className="booking-date">
                                        Booked on {formatDate(booking.createdAt)}
                                    </div>
                                    {booking.status === 'confirmed' && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleCancelBooking(booking._id)}
                                            style={{ padding: '8px 16px', fontSize: '13px' }}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default MyBookings
