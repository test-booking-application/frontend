import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/Header'
import Hero from './components/Hero'
import TicketGrid from './components/TicketGrid'
import BookingModal from './components/BookingModal'
import AuthModal from './components/AuthModal'
import MyBookings from './components/MyBookings'
import './App.css'

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

function App() {
    const [currentPage, setCurrentPage] = useState('home')
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState('login')

    useEffect(() => {
        // Check for stored user
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser))
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        }

        // Fetch tickets on mount
        fetchTickets()
    }, [])

    const fetchTickets = async (filters = {}) => {
        try {
            setLoading(true)
            const response = await axios.get('/api/tickets', { params: filters })
            setTickets(response.data)
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = (userData, token) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setShowAuthModal(false)
    }

    const handleLogout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setCurrentPage('home')
    }

    const handleBookTicket = (ticket) => {
        if (!user) {
            setAuthMode('login')
            setShowAuthModal(true)
            return
        }
        setSelectedTicket(ticket)
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return (
                    <>
                        <Hero />
                        <TicketGrid
                            tickets={tickets}
                            loading={loading}
                            onBookTicket={handleBookTicket}
                            onFilter={fetchTickets}
                        />
                    </>
                )
            case 'bookings':
                return <MyBookings user={user} />
            default:
                return null
        }
    }

    return (
        <div className="app">
            <Header
                user={user}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onLogin={() => {
                    setAuthMode('login')
                    setShowAuthModal(true)
                }}
                onSignup={() => {
                    setAuthMode('register')
                    setShowAuthModal(true)
                }}
                onLogout={handleLogout}
            />

            <main className="main-content">
                {renderPage()}
            </main>

            <footer className="app-footer">
                <p>Owned by Dilip Nigam</p>
            </footer>

            {showAuthModal && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleLogin}
                    onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                />
            )}

            {selectedTicket && (
                <BookingModal
                    ticket={selectedTicket}
                    user={user}
                    onClose={() => setSelectedTicket(null)}
                    onSuccess={() => {
                        setSelectedTicket(null)
                        setCurrentPage('bookings')
                    }}
                />
            )}
        </div>
    )
}

export default App
