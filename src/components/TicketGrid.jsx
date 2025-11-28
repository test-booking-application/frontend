import { useState } from 'react'
import './TicketGrid.css'

const eventTypeIcons = {
    movie: '🎬',
    concert: '🎵',
    sports: '⚽',
    theater: '🎭',
    conference: '💼',
    other: '🎫'
}

function TicketGrid({ tickets, loading, onBookTicket, onFilter }) {
    const [selectedType, setSelectedType] = useState('')

    const handleFilterChange = (type) => {
        setSelectedType(type)
        onFilter(type ? { eventType: type } : {})
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
                <div className="loading-text">Loading amazing events...</div>
            </div>
        )
    }

    return (
        <section className="ticket-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Upcoming Events</h2>
                    <div className="filters">
                        <button
                            className={`filter-btn ${selectedType === '' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('')}
                        >
                            All
                        </button>
                        {Object.keys(eventTypeIcons).map((type) => (
                            <button
                                key={type}
                                className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                                onClick={() => handleFilterChange(type)}
                            >
                                <span className="filter-icon">{eventTypeIcons[type]}</span>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-3">
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="ticket-card card">
                            <div className="ticket-header">
                                <span className="event-icon">{eventTypeIcons[ticket.eventType]}</span>
                                <span className={`ticket-status badge ${ticket.status === 'active' ? 'badge-success' :
                                        ticket.status === 'sold-out' ? 'badge-warning' : 'badge-info'
                                    }`}>
                                    {ticket.status}
                                </span>
                            </div>

                            <h3 className="ticket-title">{ticket.eventName}</h3>

                            <div className="ticket-details">
                                <div className="detail-item">
                                    <span className="detail-icon">📍</span>
                                    <span className="detail-text">{ticket.venue}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">📅</span>
                                    <span className="detail-text">{formatDate(ticket.date)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">🕐</span>
                                    <span className="detail-text">{ticket.time}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">🪑</span>
                                    <span className="detail-text">
                                        {ticket.availableSeats} / {ticket.totalSeats} seats
                                    </span>
                                </div>
                            </div>

                            {ticket.description && (
                                <p className="ticket-description">{ticket.description}</p>
                            )}

                            <div className="ticket-footer">
                                <div className="price-tag">
                                    <span className="price-label">From</span>
                                    <span className="price-value">{formatPrice(ticket.price)}</span>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => onBookTicket(ticket)}
                                    disabled={ticket.status !== 'active'}
                                >
                                    {ticket.status === 'active' ? 'Book Now' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {tickets.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🎫</div>
                        <h3>No events found</h3>
                        <p>Try selecting a different filter or check back later for new events.</p>
                    </div>
                )}
            </div>
        </section>
    )
}

export default TicketGrid
