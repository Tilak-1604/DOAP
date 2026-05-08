import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  useEffect(() => {
    // Add scroll animation observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.animate-on-scroll');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-text">DOAP</span>
          <span className="logo-accent">.</span>
        </div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#workflow">Workflow</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="nav-auth">
          <Link to="/login" className="l-btn-secondary">Login</Link>
          <Link to="/register" className="l-btn-primary">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content animate-on-scroll">
          <h1 className="hero-title">
            DOAP – <span className="gradient-text">Digital Outdoor Advertising Platform</span>
          </h1>
          <p className="hero-tagline">Smart, Secure, and AI-Powered Outdoor Advertisement Booking Platform.</p>
          <p className="hero-description">
            DOAP is a centralized digital platform that connects Advertisers and Digital Screen Owners for seamless outdoor advertisement management.
            The platform simplifies screen discovery, advertisement booking, payment processing, and campaign management using modern cloud technologies and AI-powered recommendations.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="l-btn-primary">Login</Link>
            <Link to="/register" className="l-btn-outline">Sign Up</Link>
            <Link to="/screens" className="l-btn-secondary">Explore Screens</Link>
          </div>
        </div>
        <div className="hero-visual animate-on-scroll">
          <div className="billboard-mockup">
            <div className="screen-content">
              <div className="glow-effect"></div>
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" alt="Digital Billboard" />
              <div className="screen-overlay">
                <h3>Your Ad Here</h3>
                <p>AI Powered Optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="l-container">
          <h2 className="section-title animate-on-scroll">What is DOAP?</h2>
          <div className="about-grid">
            <div className="about-text animate-on-scroll">
              <p>
                Traditional outdoor advertising is mostly manual, time-consuming, and lacks transparency.
                Advertisers need to contact screen owners individually, negotiate pricing manually, and manage campaigns without any centralized system.
              </p>
              <p>
                DOAP solves this problem by providing a modern web-based platform where advertisers can discover digital screens, upload advertisements, book time slots, make secure payments, and manage campaigns from a single dashboard.
              </p>
              <p>
                At the same time, screen owners can register and manage their screens, track bookings, and monitor earnings efficiently.
              </p>
            </div>
            <div className="problem-points animate-on-scroll">
              <h3>Problems in Traditional Outdoor Advertising</h3>
              <ul className="points-list">
                <li><span className="icon">✕</span> Manual booking process</li>
                <li><span className="icon">✕</span> No centralized screen discovery</li>
                <li><span className="icon">✕</span> Lack of pricing transparency</li>
                <li><span className="icon">✕</span> Risk of double-booking</li>
                <li><span className="icon">✕</span> No automated content moderation</li>
                <li><span className="icon">✕</span> Difficult campaign management</li>
                <li><span className="icon">✕</span> No AI-based recommendation system</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Features Section */}
      <section id="features" className="features-section">
        <div className="l-container">
          <h2 className="section-title animate-on-scroll">How DOAP Solves These Problems</h2>
          <div className="features-grid">
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">🔍</div>
              <h3>Smart Screen Discovery</h3>
              <p>Find digital screens based on location, category, and visibility.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">🤖</div>
              <h3>AI-Based Recommendation Engine</h3>
              <p>Machine Learning recommends suitable screens based on advertisement content and business type.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">🛡️</div>
              <h3>Secure Booking System</h3>
              <p>Conflict-free booking using database locking and atomic transactions.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">💰</div>
              <h3>Dynamic Pricing</h3>
              <p>Pricing changes intelligently based on peak hours, screen quality, and screen size.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">✨</div>
              <h3>Content Moderation</h3>
              <p>AWS Rekognition automatically validates uploaded advertisements for inappropriate content.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Integrated Razorpay payment gateway for reliable and secure transactions.</p>
            </div>
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">📊</div>
              <h3>Role-Based Dashboards</h3>
              <p>Separate dashboards for Advertisers, Screen Owners, and Admin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="workflow-section">
        <div className="l-container">
          <h2 className="section-title animate-on-scroll">How the Platform Works</h2>
          <div className="workflow-steps">
            {[
              "Screen Owner registers advertising screens.",
              "Admin reviews and approves screens.",
              "Advertiser uploads advertisement content.",
              "AWS Rekognition validates uploaded content.",
              "Advertiser searches or gets AI-based screen recommendations.",
              "Advertiser books available time slots.",
              "Payment processed securely via Razorpay.",
              "Screen Owner views confirmed bookings and displays advertisements."
            ].map((step, index) => (
              <div key={index} className="workflow-step animate-on-scroll">
                <div className="step-number">{index + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="roles-section">
        <div className="l-container">
          <h2 className="section-title animate-on-scroll">Platform User Roles</h2>
          <div className="roles-grid">
            <div className="role-card advertiser-role animate-on-scroll">
              <h3>Advertiser</h3>
              <ul>
                <li>Upload advertisements</li>
                <li>Search and book screens</li>
                <li>Make payments</li>
                <li>Track bookings and spending</li>
                <li>Download invoices</li>
              </ul>
            </div>
            <div className="role-card owner-role animate-on-scroll">
              <h3>Screen Owner</h3>
              <ul>
                <li>Register and manage screens</li>
                <li>Track bookings</li>
                <li>Monitor earnings</li>
                <li>Manage screen availability</li>
              </ul>
            </div>
            <div className="role-card admin-role animate-on-scroll">
              <h3>Admin</h3>
              <ul>
                <li>Approve/reject screens</li>
                <li>Manage users</li>
                <li>Monitor platform activities</li>
                <li>Configure pricing settings</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section">
        <div className="l-container">
          <h2 className="section-title animate-on-scroll">Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-category animate-on-scroll">
              <h4>Frontend</h4>
              <p>React, Tailwind CSS, Axios, Chart.js</p>
            </div>
            <div className="tech-category animate-on-scroll">
              <h4>Backend</h4>
              <p>Spring Boot, Spring Security, JWT, Hibernate</p>
            </div>
            <div className="tech-category animate-on-scroll">
              <h4>Cloud</h4>
              <p>AWS S3, AWS Rekognition, Razorpay, Google OAuth</p>
            </div>
            <div className="tech-category animate-on-scroll">
              <h4>AI & ML</h4>
              <p>Python Flask, Sentence-BERT, Scikit-learn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Scope Section */}
      <section className="future-section">
        <div className="l-container">
          <h2 className="section-title animate-on-scroll">Future Enhancements</h2>
          <div className="future-grid">
            <div className="future-card animate-on-scroll">
              <div className="future-icon">🌐</div>
              <p>IoT integration for automatic screen playback</p>
            </div>
            <div className="future-card animate-on-scroll">
              <div className="future-icon">📈</div>
              <p>Real-time bidding system for advertisement slots</p>
            </div>
            <div className="future-card animate-on-scroll">
              <div className="future-icon">📱</div>
              <p>Mobile application support</p>
            </div>
            <div className="future-card animate-on-scroll">
              <div className="future-icon">📊</div>
              <p>Advanced audience analytics</p>
            </div>
            <div className="future-card animate-on-scroll">
              <div className="future-icon">🧠</div>
              <p>AI-powered campaign optimization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose DOAP Section */}
      <section className="why-section">
        <div className="l-container">
          <h2 className="section-title animate-on-scroll">Why Choose DOAP?</h2>
          <div className="why-grid">
            {[
              "Centralized advertisement management",
              "Modern cloud-based architecture",
              "AI-powered recommendations",
              "Automated moderation system",
              "Secure and scalable infrastructure",
              "User-friendly dashboards"
            ].map((point, index) => (
              <div key={index} className="why-point animate-on-scroll">
                <span className="check-icon">✓</span>
                <p>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-on-scroll">
        <div className="l-container">
          <h2>Start Advertising Smarter Today</h2>
          <p>Join DOAP to modernize digital outdoor advertising with intelligent booking, AI recommendations, and secure cloud-powered management.</p>
          <div className="cta-actions">
            <Link to="/register" className="l-btn-primary">Create Account</Link>
            <Link to="/login" className="l-btn-outline">Login</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="l-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>DOAP</h3>
              <p>Smart Digital Outdoor Advertising</p>
            </div>
            <div className="footer-links">
              <a href="#about">About</a>
              <a href="#features">Features</a>
              <a href="#contact">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 DOAP – Digital Outdoor Advertising Platform. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
