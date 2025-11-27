import React, { useState, useEffect, useRef } from "react";
import { Menu, X, LogIn, CheckCircle, Users, BarChart3, Clock, Zap, Shield, ArrowRight, Layers, Mail, MapPin, Phone, Check } from 'lucide-react';

// --- CSS Styles ---
const styles = `
  /* Global Reset/Base */
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #f5f3ff; overflow-x: hidden; }

  /* --- Navbar Styles (Fixed Alignment) --- */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    padding: 16px 0;
    transition: all 0.3s ease;
    background: transparent;
  }
  
  .navbar.scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    padding: 10px 0;
  }

  /* Force white background if not on home page */
  .navbar.solid {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    padding: 10px 0;
  }

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  /* --- Hollow Wireframe Logo Styles --- */
  .nav-brand {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 800;
    font-size: 20px;
    color: #1f2937;
    text-decoration: none;
    gap: 12px;
  }

  .mini-cube-container {
    width: 24px;
    height: 24px;
    perspective: 400px;
  }

  .mini-cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transform: rotateX(-30deg) rotateY(45deg); /* Static 3D perspective */
  }

  .mini-face {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 2px solid #7c3aed; /* Reverted: Borders on all faces (Wireframe) */
    background: transparent;
  }

  /* Positioning faces for 24px cube (12px translation) - No backgrounds */
  .mini-front  { transform: rotateY(  0deg) translateZ(12px); }
  .mini-back   { transform: rotateY(180deg) translateZ(12px); }
  .mini-right  { transform: rotateY( 90deg) translateZ(12px); }
  .mini-left   { transform: rotateY(-90deg) translateZ(12px); }
  .mini-top    { transform: rotateX( 90deg) translateZ(12px); }
  .mini-bottom { transform: rotateX(-90deg) translateZ(12px); }

  /* --- Navigation Links & Actions --- */
  .nav-links {
    display: none;
    gap: 32px;
  }

  .nav-link {
    color: #4b5563;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
  }
  .nav-link:hover, .nav-link.active { color: #7c3aed; }

  .nav-actions {
    display: none;
    align-items: center;
    gap: 16px;
  }

  .mobile-menu-btn {
    display: block;
    background: none;
    border: none;
    cursor: pointer;
    color: #4b5563;
  }

  @media (min-width: 768px) {
    .nav-links { display: flex; }
    .nav-actions { display: flex; }
    .mobile-menu-btn { display: none; }
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: white;
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-top: 1px solid #f3f4f6;
  }

  /* --- Animation Keyframes --- */
  @keyframes rotateCube {
    0%   { transform: rotateX(0deg) rotateY(0deg); }
    100% { transform: rotateX(360deg) rotateY(360deg); }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }

  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  /* --- Utility Classes --- */
  .fade-in-section {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    will-change: opacity, visibility;
  }

  .fade-in-section.is-visible {
    opacity: 1;
    transform: none;
  }

  /* --- Background Effects --- */
  .bg-blob {
    position: absolute;
    filter: blur(80px);
    z-index: 0;
    opacity: 0.6;
    animation: blob 10s infinite alternate;
  }

  .blob-1 { top: 0; left: 0; width: 300px; height: 300px; background: #ddd6fe; border-radius: 50%; }
  .blob-2 { bottom: 0; right: 0; width: 400px; height: 400px; background: #e9d5ff; border-radius: 50%; }
  .blob-3 { top: 40%; left: 20%; width: 200px; height: 200px; background: #c4b5fd; border-radius: 50%; animation-delay: 2s; }

  /* --- Layout Components --- */
  
  .hero-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px 20px 40px;
    position: relative;
    z-index: 1;
  }

  .card {
    max-width: 600px;
    width: 100%;
    background-color: white;
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 10px 40px -10px rgba(124, 58, 237, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.8);
    text-align: center;
    position: relative;
    z-index: 10;
    backdrop-filter: blur(10px);
  }

  /* Big Hero Cube (Keep Solid) */
  .cube {
    width: 100px;
    height: 100px;
    margin: 0 auto 30px auto;
    position: relative;
    transform-style: preserve-3d;
    animation: rotateCube 8s infinite linear;
  }

  .face {
    position: absolute;
    width: 100px;
    height: 100px;
    background-color: #7c3aed;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 14px;
    border: 2px solid white;
    backface-visibility: hidden;
    opacity: 0.95;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.5);
  }

  .front  { transform: rotateY(  0deg) translateZ(50px); }
  .back   { transform: rotateY(180deg) translateZ(50px); }
  .right  { transform: rotateY( 90deg) translateZ(50px); }
  .left   { transform: rotateY(-90deg) translateZ(50px); }
  .top    { transform: rotateX( 90deg) translateZ(50px); }
  .bottom { transform: rotateX(-90deg) translateZ(50px); }

  /* Typography */
  .title { font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #1f2937; letter-spacing: -0.5px; }
  .subtitle { color: #7c3aed; font-size: 18px; margin-bottom: 30px; min-height: 28px; font-weight: 500; }
  
  .hero-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; text-align: left; background: #f9fafb; padding: 20px; border-radius: 12px; }
  .hero-item { display: flex; align-items: center; gap: 12px; }
  .hero-item-icon { color: #7c3aed; background: #ede9fe; padding: 6px; border-radius: 50%; }
  .hero-item-text { font-size: 15px; color: #4b5563; font-weight: 500; }

  /* Buttons */
  .buttons-group { display: flex; flex-direction: column; gap: 12px; }
  
  .btn {
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    border: none;
  }

  .btn-sm { padding: 8px 16px; font-size: 14px; border-radius: 8px; }

  .btn-primary { background-color: #7c3aed; color: white; box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.39); }
  .btn-primary:hover { background-color: #6d28d9; transform: translateY(-2px); box-shadow: 0 6px 20px 0 rgba(124, 58, 237, 0.39); }
  
  .btn-secondary { background-color: white; color: #7c3aed; border: 2px solid #ddd6fe; }
  .btn-secondary:hover { background-color: #f5f3ff; border-color: #7c3aed; }

  .btn-ghost { background: transparent; color: #4b5563; }
  .btn-ghost:hover { color: #7c3aed; background: #f3f4f6; }

  /* --- New Content Sections --- */
  .section { padding: 80px 20px; position: relative; z-index: 2; }
  .section-white { background: white; }
  
  .section-header { text-align: center; max-width: 800px; margin: 0 auto 60px; }
  .section-title { font-size: 36px; font-weight: 800; color: #111827; margin-bottom: 16px; }
  .section-desc { font-size: 18px; color: #6b7280; line-height: 1.6; }
  
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: white;
    padding: 30px;
    border-radius: 20px;
    border: 1px solid #f3f4f6;
    transition: all 0.3s ease;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1);
    border-color: #ddd6fe;
  }

  .feature-icon-wrapper {
    width: 60px;
    height: 60px;
    background: #f5f3ff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: #7c3aed;
    transition: transform 0.3s ease;
  }

  .feature-card:hover .feature-icon-wrapper { transform: scale(1.1) rotate(5deg); background: #7c3aed; color: white; }

  .feature-title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 12px; }
  .feature-text { color: #6b7280; line-height: 1.6; }

  .stats-section { background: #7c3aed; color: white; padding: 60px 20px; }
  .stat-item { text-align: center; padding: 20px; }
  .stat-number { font-size: 48px; font-weight: 800; margin-bottom: 8px; }
  .stat-label { font-size: 16px; opacity: 0.9; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }

  /* Pricing Page Styles */
  .pricing-card {
    background: white;
    border-radius: 24px;
    padding: 40px;
    border: 1px solid #f3f4f6;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    position: relative;
  }

  .pricing-card.popular {
    border-color: #7c3aed;
    box-shadow: 0 20px 40px -10px rgba(124, 58, 237, 0.15);
    transform: scale(1.05);
    z-index: 2;
  }

  .pricing-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
  }

  .pricing-card.popular:hover {
    transform: scale(1.05) translateY(-8px);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #7c3aed;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .price-amount {
    font-size: 48px;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .price-period {
    font-size: 16px;
    color: #6b7280;
    font-weight: 500;
  }

  .pricing-features {
    list-style: none;
    padding: 0;
    margin: 32px 0;
    flex-grow: 1;
  }

  .pricing-feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #4b5563;
    gap: 12px;
  }

  .pricing-check {
    color: #7c3aed;
    background: #f5f3ff;
    border-radius: 50%;
    padding: 2px;
  }

  /* Contact Page Styles */
  .contact-container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .contact-info {
    background: #7c3aed;
    color: white;
    padding: 40px;
  }

  .contact-form-wrapper {
    padding: 40px;
    flex: 1;
  }

  .form-group { margin-bottom: 20px; }
  .form-label { display: block; margin-bottom: 8px; font-weight: 500; color: #374151; }
  .form-input { 
    width: 100%; 
    padding: 12px; 
    border: 1px solid #e5e7eb; 
    border-radius: 8px; 
    font-size: 16px; 
    transition: border-color 0.2s;
  }
  .form-input:focus { border-color: #7c3aed; outline: none; ring: 2px solid rgba(124, 58, 237, 0.1); }

  @media(min-width: 768px) {
    .contact-container { flex-direction: row; }
    .contact-info { width: 40%; }
  }

  .footer { background: #111827; color: #9ca3af; padding: 60px 20px 30px; }
  .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; margin-bottom: 40px; }
  .footer-brand { color: white; font-size: 24px; font-weight: 700; margin-bottom: 20px; display: block; }
  .footer-link { display: block; color: #9ca3af; text-decoration: none; margin-bottom: 12px; transition: color 0.2s; cursor: pointer; }
  .footer-link:hover { color: white; }
  .footer-bottom { text-align: center; border-top: 1px solid #374151; padding-top: 30px; font-size: 14px; }
`;

// --- Utility Components ---

const ScrollReveal = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Navbar Component ---
const Navbar = ({ activePage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine class based on state: if not home, always use 'solid' background
  const navClass = activePage === 'home' 
    ? `navbar ${scrolled ? 'scrolled' : ''}`
    : `navbar solid`;

  return (
    <nav className={navClass}>
      <div className="navbar-container">
        
        {/* Brand with Hollow Wireframe Logo */}
        <div className="nav-brand" onClick={() => onNavigate('home')}>
          <div className="mini-cube-container">
            <div className="mini-cube">
              <div className="mini-face mini-front"></div>
              <div className="mini-face mini-back"></div>
              <div className="mini-face mini-right"></div>
              <div className="mini-face mini-left"></div>
              <div className="mini-face mini-top"></div>
              <div className="mini-face mini-bottom"></div>
            </div>
          </div>
          Milestack
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
          {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
            <button 
              key={item} 
              onClick={() => onNavigate(item.toLowerCase())}
              className={`nav-link ${activePage === item.toLowerCase() ? 'active' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="nav-actions">
          <button className="btn btn-ghost btn-sm flex items-center">
            <LogIn className="w-4 h-4 mr-2" /> Login
          </button>
          <button className="btn btn-primary btn-sm">
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="mobile-menu-btn">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
            <button 
              key={item} 
              className="nav-link" 
              style={{ textAlign: 'left', padding: '10px 0' }}
              onClick={() => {
                onNavigate(item.toLowerCase());
                setIsOpen(false);
              }}
            >
              {item}
            </button>
          ))}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
            <button className="btn btn-ghost btn-sm w-full" style={{ justifyContent: 'flex-start' }}>
               <LogIn className="w-4 h-4 mr-2" /> Login
            </button>
            <button className="btn btn-primary btn-sm w-full" style={{ marginTop: '10px' }}>
              Sign Up Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Page Sections ---

const Hero = ({ onNavigate }) => {
  const messages = [
    "Welcome to Milestack!",
    "Organize your projects...",
    "Track progress in real-time...",
    "Collaborate seamlessly!"
  ];

  const [currentMsg, setCurrentMsg] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (charIndex < messages[msgIndex].length) {
        setCurrentMsg((prev) => prev + messages[msgIndex][charIndex]);
        setCharIndex(charIndex + 1);
      } else {
        setTimeout(() => {
          setCurrentMsg("");
          setCharIndex(0);
          setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 1500);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [charIndex, msgIndex, messages]);

  return (
    <div className="hero-container" id="home">
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <div className="card">
        {/* Main Solid Cube */}
        <div className="cube">
          <div className="face front">Milestack</div>
          <div className="face back"></div>
          <div className="face right"></div>
          <div className="face left"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>

        <h1 className="title">Milestack</h1>
        <p className="subtitle">{currentMsg}</p>

        <div className="hero-list">
          <div className="hero-item">
            <div className="hero-item-icon"><CheckCircle size={18} /></div>
            <span className="hero-item-text">Simplified task management for teams</span>
          </div>
          <div className="hero-item">
            <div className="hero-item-icon"><Users size={18} /></div>
            <span className="hero-item-text">Real-time collaboration tools</span>
          </div>
          <div className="hero-item">
            <div className="hero-item-icon"><BarChart3 size={18} /></div>
            <span className="hero-item-text">Advanced productivity analytics</span>
          </div>
        </div>

        <div className="buttons-group">
          <button onClick={() => onNavigate('features')} className="btn btn-primary">
            Explore Features <ArrowRight size={18} className="ml-2" />
          </button>
          <button onClick={() => onNavigate('contact')} className="btn btn-secondary">
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};

const Features = () => (
  <section className="section section-white" id="features">
    <div className="max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="section-header">
          <h2 className="section-title">Why Choose Milestack?</h2>
          <p className="section-desc">We provide the tools you need to build, scale, and manage your projects effectively without the clutter.</p>
        </div>
      </ScrollReveal>
      
      <div className="grid-3">
        {[
          { icon: <Clock />, title: "Time Tracking", desc: "Keep track of every minute spent on your projects with our automated timers." },
          { icon: <Zap />, title: "Instant Sync", desc: "Changes made by your team update in real-time across all devices." },
          { icon: <Shield />, title: "Enterprise Security", desc: "Your data is encrypted and protected with bank-grade security protocols." },
          { icon: <BarChart3 />, title: "Analytics", desc: "Gain insights into your team's performance with detailed charts." },
          { icon: <Users />, title: "Team Management", desc: "Manage roles, permissions, and team access easily from one dashboard." },
          { icon: <Layers />, title: "Workflow Automation", desc: "Automate repetitive tasks to focus on what really matters." }
        ].map((feature, i) => (
          <ScrollReveal key={i} delay={i * 100}>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                {React.cloneElement(feature.icon, { size: 28 })}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-text">{feature.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="stats-section">
    <div className="max-w-7xl mx-auto grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <ScrollReveal>
        <div className="stat-item">
          <div className="stat-number">10k+</div>
          <div className="stat-label">Active Users</div>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={200}>
        <div className="stat-item">
          <div className="stat-number">5M+</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={400}>
        <div className="stat-item">
          <div className="stat-number">99.9%</div>
          <div className="stat-label">Uptime</div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

const PricingPage = () => (
  <div className="section" style={{ paddingTop: '120px', minHeight: '80vh' }}>
    <ScrollReveal>
      <div className="section-header">
        <h2 className="section-title">Simple, Transparent Pricing</h2>
        <p className="section-desc">Choose the plan that fits your team's needs. No hidden fees.</p>
      </div>
    </ScrollReveal>

    <div className="grid-3">
      {/* Basic Plan */}
      <div className="pricing-card">
        <h3 className="feature-title">Starter</h3>
        <div className="price-amount">₹0 <span className="price-period">/mo</span></div>
        <p className="feature-text">Perfect for individuals and small projects.</p>
        
        <ul className="pricing-features">
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Up to 3 Projects</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Basic Analytics</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> 24-hour Support</li>
        </ul>
        <button className="btn btn-secondary w-full">Get Started</button>
      </div>

      {/* Pro Plan */}
      <div className="pricing-card popular">
        <div className="popular-badge">Most Popular</div>
        <h3 className="feature-title">Pro Team</h3>
        <div className="price-amount">₹2,499 <span className="price-period">/mo</span></div>
        <p className="feature-text">For growing teams that need more power.</p>
        
        <ul className="pricing-features">
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Unlimited Projects</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Advanced Analytics</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Priority Support</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Team Collaboration</li>
        </ul>
        <button className="btn btn-primary w-full">Start Free Trial</button>
      </div>

      {/* Enterprise Plan */}
      <div className="pricing-card">
        <h3 className="feature-title">Enterprise</h3>
        <div className="price-amount">₹8,499 <span className="price-period">/mo</span></div>
        <p className="feature-text">For large organizations with specific needs.</p>
        
        <ul className="pricing-features">
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Everything in Pro</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Dedicated Account Manager</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> Custom Integrations</li>
          <li className="pricing-feature-item"><Check size={16} className="pricing-check" /> SSO & Advanced Security</li>
        </ul>
        <button className="btn btn-secondary w-full">Contact Sales</button>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="section" style={{ paddingTop: '120px', minHeight: '80vh' }}>
    <ScrollReveal>
      <div className="section-header">
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-desc">Have questions about Milestack? We'd love to hear from you.</p>
      </div>
    </ScrollReveal>

    <div className="contact-container">
      {/* Contact Info Side */}
      <div className="contact-info">
        <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
        <p className="mb-8 opacity-90">Fill up the form and our team will get back to you within 24 hours.</p>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Phone className="w-5 h-5" />
            <span>+91 987-123-4567</span>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="w-5 h-5" />
            <span>hello@milestack.com</span>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5" />
            <span>123 Innovation Dr, Tech City, TC 90210</span>
          </div>
        </div>

       
      </div>

      {/* Form Side */}
      <div className="contact-form-wrapper">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="john@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" rows="4" placeholder="How can we help you?"></textarea>
          </div>
          <button className="btn btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  </div>
);

const Footer = ({ onNavigate }) => (
  <footer className="footer" id="footer">
    <div className="footer-grid">
      <div>
        <span className="footer-brand">Milestack</span>
        <p style={{ lineHeight: '1.6' }}>
          Empowering teams to achieve more together. 
          Simple, powerful, and built for modern workflows.
        </p>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4">Product</h4>
        <span onClick={() => onNavigate('features')} className="footer-link">Features</span>
        <span onClick={() => onNavigate('pricing')} className="footer-link">Pricing</span>
        <span className="footer-link">Integrations</span>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4">Company</h4>
        <span className="footer-link">About Us</span>
        <span className="footer-link">Careers</span>
        <span onClick={() => onNavigate('contact')} className="footer-link">Contact</span>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4">Connect</h4>
        <span className="footer-link">Twitter</span>
        <span className="footer-link">LinkedIn</span>
        <span className="footer-link">GitHub</span>
      </div>
    </div>
    <div className="footer-bottom">
      &copy; {new Date().getFullYear()} Milestack Inc. All rights reserved.
    </div>
  </footer>
);

// --- Main App ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <style>{styles}</style>
      <Navbar activePage={currentPage} onNavigate={handleNavigate} />
      
      {currentPage === 'home' && (
        <>
          <Hero onNavigate={handleNavigate} />
          <Features />
          <Stats />
        </>
      )}

      {currentPage === 'features' && (
        <>
           <div style={{ paddingTop: '80px' }}>
              <Features />
              <Stats />
           </div>
        </>
      )}

      {currentPage === 'pricing' && (
        <PricingPage />
      )}

      {currentPage === 'contact' && (
        <ContactPage />
      )}

      <Footer onNavigate={handleNavigate} />
    </>
  );
}