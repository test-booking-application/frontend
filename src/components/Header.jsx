import './Header.css'

function Header({ user, currentPage, onNavigate, onLogin, onSignup, onLogout }) {
    return (
        <header className="header glassmorphism">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <h1 className="gradient-text">TicketHub</h1>
                        <p className="tagline">Premium Event Booking</p>
                    </div>

                    <nav className="nav">
                        <button
                            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                            onClick={() => onNavigate('home')}
                        >
                            Events
                        </button>
                        {user && (
                            <button
                                className={`nav-link ${currentPage === 'bookings' ? 'active' : ''}`}
                                onClick={() => onNavigate('bookings')}
                            >
                                My Bookings
                            </button>
                        )}
                    </nav>

                    <div className="header-actions">
                        {user ? (
                            <div className="user-menu">
                                <div className="user-info">
                                    <span className="user-name">{user.username}</span>
                                    <span className="user-role badge badge-info">{user.role}</span>
                                </div>
                                <button onClick={onLogout} className="btn btn-secondary">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <button onClick={onLogin} className="btn btn-secondary">
                                    Login
                                </button>
                                <button onClick={onSignup} className="btn btn-primary">
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
