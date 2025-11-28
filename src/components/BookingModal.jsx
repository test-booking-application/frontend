import { useState } from 'react'
import axios from 'axios'

function BookingModal({ ticket, user, onClose, onSuccess }) {
    const [quantity, setQuantity] = useState(1)
    const [contactEmail, setContactEmail] = useState(user.email || '')
    const [contactPhone, setContactPhone] = useState(user.phone || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const totalPrice = ticket.price * quantity

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await axios.post('/api/bookings', {
                userId: user.id,
                username: user.username,
                ticketId: ticket._id,
                quantity,
                contactEmail,
                contactPhone
            })

            onSuccess(response.data.booking)
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while booking')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2>Complete Your Booking</h2>

                {error && <div className="error">{error}</div>}

                <div className="booking-summary card" style={{ background: 'var(--bg-secondary)', marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>{ticket.eventName}</h3>
                    <div className="detail-item" style={{ marginBottom: '8px' }}>
                        <span className="detail-icon">📍</span>
                        <span className="detail-text">{ticket.venue}</span>
                    </div>
                    <div className="detail-item" style={{ marginBottom: '8px' }}>
                        <span className="detail-icon">📅</span>
                        <span className="detail-text">{formatDate(ticket.date)}</span>
                    </div>
                    <div className="detail-item" style={{ marginBottom: '8px' }}>
                        <span className="detail-icon">🕐</span>
                        <span className="detail-text">{ticket.time}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-icon">💵</span>
                        <span className="detail-text">{formatPrice(ticket.price)} per ticket</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Number of Tickets</label>
                        <input
                            type="number"
                            className="form-input"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(ticket.availableSeats, parseInt(e.target.value) || 1)))}
                            min="1"
                            max={ticket.availableSeats}
                            required
                        />
                        <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            {ticket.availableSeats} seats available
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Phone</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div style={{
                        padding: '20px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>Total Amount</span>
                        <span style={{
                            fontSize: '32px',
                            fontWeight: '800',
                            background: 'var(--success-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {formatPrice(totalPrice)}
                        </span>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default BookingModal
