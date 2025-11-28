import './Hero.css'

function Hero() {
    return (
        <section className="hero">
            <div className="container">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">
                        Experience the <span className="gradient-text">Best Events</span>
                    </h1>
                    <p className="hero-subtitle">
                        Book tickets for concerts, movies, sports, and more. Your gateway to unforgettable experiences.
                    </p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-value gradient-text">5000+</div>
                            <div className="stat-label">Events</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value gradient-text">100K+</div>
                            <div className="stat-label">Happy Customers</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value gradient-text">50+</div>
                            <div className="stat-label">Cities</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hero-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>
        </section>
    )
}

export default Hero
