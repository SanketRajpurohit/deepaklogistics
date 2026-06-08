import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logoImg from './assets/logo-bg.png';

// ─── Static Data (moved out of component) ───────────────────────────────────
const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Delivering Excellence, Every Mile.",
    subtitle: "Reliable, secure, and modern logistics solutions tailored for your business."
  },
  {
    image: "https://images.unsplash.com/photo-1708809046391-cf7d9e91b4e7?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0",
    title: "Global Supply Chain Experts.",
    subtitle: "End-to-end warehousing and distribution designed to streamline your operations."
  },
  {
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Fast, Secure, & Trackable.",
    subtitle: "Ensuring your cargo reaches its destination safely, on time, every single time."
  }
];

const BRANCHES = [
  "Narol", "Vadodara", "Ankleshwar", "Surat", "Vapi",
  "Mumbai", "Nashik", "Kolhapur", "Hyderabad", "Gurgaon",
  "Delhi", "Bahadurgarh", "Jaipur", "Ghaziabad", "Rajkot",
  "Kalol", "Bangalore", "Chennai"
];

const SERVICES = [
  {
    icon: "🚛",
    title: "Heavy Haulage",
    desc: "Specialized in all types of heavy cargo vehicles with full truck load capacity and secure handling."
  },
  {
    icon: "📦",
    title: "Supply Chain",
    desc: "End-to-end warehousing and distribution solutions designed to streamline your business operations."
  },
  {
    icon: "🌍",
    title: "Freight Forwarding",
    desc: "Fast and reliable freight services ensuring your goods cross borders without unexpected delays."
  }
];

// ─── Form initial state ──────────────────────────────────────────────────────
const INITIAL_FORM = {
  companyName: '',
  phone: '',
  email: '',
  message: ''
};

// ─── Component ───────────────────────────────────────────────────────────────
function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formStatus, setFormStatus] = useState('idle'); // idle | success | error
  const observerRef = useRef(null);

  // ── Smart navbar: hide on scroll down, show on scroll up ──
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setIsNavVisible(true);
      } else if (currentY > lastScrollY) {
        setIsNavVisible(false);
        setIsMenuOpen(false); // close mobile menu when hiding nav
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // ── Auto-play carousel ──
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ── Scroll-triggered fade-in animations ──
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  // ── Form handling ──

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formDataToSend = new FormData();

    formDataToSend.append("companyName", formData.companyName);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("message", formData.message);

    formDataToSend.append(
      "_subject",
      "New Quote Request - Deepak Logistics"
    );

    formDataToSend.append(
      "_captcha",
      "false"
    );

    formDataToSend.append(
      "_template",
      "table"
    );

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/rohtash@deepaklogistics.co.in",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      console.log("FormSubmit Response:", data);

      if (data.success === "true" || data.success === true) {
        setFormStatus("success");
        setFormData(INITIAL_FORM);

        setTimeout(() => {
          setFormStatus("idle");
        }, 5000);
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send inquiry. Please try again.");
    }
  };

    // ── Form validation ──
    const validate = () => {
      const errors = {};

      if (!formData.companyName.trim()) {
        errors.companyName = "Company name is required";
      }

      if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
        errors.phone = "Phone number must be exactly 10 digits";
      }

      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        errors.email = "Enter a valid email address";
      }

      if (!formData.message.trim()) {
        errors.message = "Message is required";
      } else if (formData.message.trim().length < 10) {
        errors.message =
          "Please enter at least 10 characters";
      }
      return errors;
    };

    const handleChange = (e) => {
      const { id, value } = e.target;

      setFormData(prev => ({
        ...prev,
        [id]: value
      }));

      if (formErrors[id]) {
        setFormErrors(prev => ({
          ...prev,
          [id]: ""
        }));
      }
    };


    const closeMenu = () => setIsMenuOpen(false);

    return (
      <div className="app-container">

        {/* ── Navigation ── */}
        <nav className={`navbar ${isNavVisible ? 'nav-visible' : 'nav-hidden'}`}>
          <div className="logo">
            <img src={logoImg} alt="Deepak Logistics Logo" className="brand-logo" />
            <h1>DEEPAK <span>LOGISTICS</span></h1>
          </div>

          <ul className="nav-links desktop-nav">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#branches">Network</a></li>
            <li><a href="#contact" className="btn-primary">Contact Us</a></li>
          </ul>

          <button
            className={`hamburger ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
            <a href="#home" onClick={closeMenu}>Home</a>
            <a href="#about" onClick={closeMenu}>About Us</a>
            <a href="#services" onClick={closeMenu}>Services</a>
            <a href="#branches" onClick={closeMenu}>Our Network</a>
            <a href="#contact" onClick={closeMenu} className="mobile-cta">Contact Us</a>
          </div>
        </nav>

        {/* ── Hero Carousel ── */}
        <header id="home" className="hero-section">
          {SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(15,23,42,0.65), rgba(15,23,42,0.8)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ))}

          <div className="hero-content" key={currentSlide}>
            <p className="hero-eyebrow fade-in-up">India's Trusted Logistics Partner</p>
            <h2 className="fade-in-up delay-1">{SLIDES[currentSlide].title}</h2>
            <p className="fade-in-up delay-2">{SLIDES[currentSlide].subtitle}</p>
            <div className="hero-buttons fade-in-up delay-3">
              <a href="#services" className="btn-secondary">Explore Services</a>
              <a href="#contact" className="btn-primary">Get a Quote</a>
            </div>
          </div>

          <div className="carousel-indicators">
            {SLIDES.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          {/* Scroll hint */}
          <div className="scroll-hint">
            <div className="scroll-mouse"><div className="scroll-wheel" /></div>
          </div>
        </header>

        {/* ── Stats Bar ── */}
        <div className="stats-bar">
          <div className="stat-bar-item animate-on-scroll">
            <h3>13+</h3><p>Years in Business</p>
          </div>
          <div className="stat-bar-divider" />
          <div className="stat-bar-item animate-on-scroll">
            <h3>100+</h3><p>Satisfied Clients</p>
          </div>
          <div className="stat-bar-divider" />
          <div className="stat-bar-item animate-on-scroll">
            <h3>50+</h3><p>Modern Vehicles</p>
          </div>
          <div className="stat-bar-divider" />
          <div className="stat-bar-item animate-on-scroll">
            <h3>15+</h3><p>City Network</p>
          </div>
          <div className="stat-bar-divider" />
          <div className="stat-bar-item animate-on-scroll">
            <h3>24/7</h3><p>Support Ready</p>
          </div>
        </div>

        {/* ── About ── */}
        <section id="about" className="about-section">
          <div className="about-container">
            <div className="about-image-wrapper animate-on-scroll">
              <img
                src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Deepak Logistics Fleet Operations"
                className="about-image"
              />
              <div className="experience-badge">
                <span className="years">13+</span>
                <span className="text">Years of<br />Excellence</span>
              </div>
            </div>

            <div className="about-content animate-on-scroll">
              <div className="section-header">
                <h4 className="subtitle">ABOUT DEEPAK LOGISTICS</h4>
                <h2>Driving Your Business Forward With <span>Precision</span></h2>
              </div>
              <p>
                Rooted in Ahmedabad, Gujarat, Deepak Logistics has grown into a premier transportation and supply chain partner. We blend traditional reliability with modern, technology-driven solutions to ensure your cargo is handled with the utmost care and efficiency.
              </p>
              <p>
                Our dedicated team understands that every minute counts in logistics. That's why we operate around the clock, offering tailored freight forwarding, heavy haulage, and warehouse management to keep your business moving seamlessly across the nation.
              </p>
              <a href="#contact" className="btn-primary about-cta">Request a Quote &rarr;</a>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="services-section">
          <div className="section-title animate-on-scroll">
            <h4 className="subtitle-center">WHAT WE OFFER</h4>
            <h2>Our Expertise</h2>
            <p>Comprehensive transport and logistics solutions driven by modern technology.</p>
          </div>
          <div className="services-grid">
            {SERVICES.map((service, i) => (
              <div className="service-card animate-on-scroll" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="icon-wrapper">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <a href="#contact" className="service-cta">Get a Quote &rarr;</a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Branches & Network ── */}
        <section id="branches" className="branches-section">
          <div className="branches-header animate-on-scroll">
            <h4 className="subtitle">OUR NATIONAL NETWORK</h4>
            <h2>Connecting India, <span>Every Single Day.</span></h2>
            <p>With 18 strategic hubs across the country, we ensure rapid, uninterrupted freight movement from North to South.</p>
          </div>

          <div className="network-container animate-on-scroll">
            <div className="network-background-line" />
            <div className="branches-grid">
              {BRANCHES.map((branch, index) => (
                <div className="branch-item" key={index}>
                  <div className="mini-pulse-container">
                    <div className="mini-pulse-ring" />
                    <div className="mini-pulse-dot" />
                  </div>
                  <h3>{branch}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact & Quote ── */}
        <section id="contact" className="contact-section">
          <div className="contact-container">
            <div className="contact-info-wrapper animate-on-scroll">
              <h4 className="subtitle">GET IN TOUCH</h4>
              <h2>Request a <span>Quote</span></h2>
              <p className="contact-subtitle">
                Ready to streamline your logistics? Fill out the form and our operations team will get back to you within 24 hours.
              </p>
              <div className="contact-details">
                <div className="detail-item">
                  <span className="detail-icon">📧</span>
                  <p><strong>Email:</strong> rohtash@deepaklogistics.co.in</p>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📞</span>
                  <p><strong>Phone:</strong> +91 93279 61075 &nbsp;|&nbsp; +91 87802 60546</p>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <p><strong>HO:</strong> H O 25, Sohang Residency, Behind Akash Metro City, Isanpur, Ahmedabad, Gujarat – 382427</p>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕒</span>
                  <p><strong>Hours:</strong> Monday – Saturday, 10:00 AM – 6:00 PM</p>
                </div>
              </div>
            </div>

            <div className="quote-form-wrapper animate-on-scroll">
              {formStatus === 'success' ? (
                <div className="form-success">
                  <div className="success-icon">✓</div>
                  <h3>Message Received!</h3>
                  <p>Thank you for reaching out. Our team will contact you within 24 hours.</p>
                  <button className="btn-primary" onClick={() => setFormStatus('idle')}>Send Another</button>
                </div>
              ) : (
                <form
                  className="quote-form"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <input
                    type="hidden"
                    name="_subject"
                    value="New Quote Request from Deepak Logistics Website"
                  />

                  <input
                    type="hidden"
                    name="_captcha"
                    value="false"
                  />

                  <input
                    type="hidden"
                    name="_template"
                    value="table"
                  />

                  {/* Rest of form fields */}

                  <div className="form-group">
                    <label htmlFor="companyName">Company Name</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      placeholder="e.g. Acme Corp Ltd."
                      value={formData.companyName}
                      onChange={handleChange}
                      className={formErrors.companyName ? 'input-error' : ''}
                    />
                    {formErrors.companyName && <span className="error-msg">{formErrors.companyName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        maxLength={10}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");

                          setFormData((prev) => ({
                            ...prev,
                            phone: value,
                          }));

                          if (formErrors.phone) {
                            setFormErrors((prev) => ({
                              ...prev,
                              phone: "",
                            }));
                          }
                        }}
                        className={formErrors.phone ? "input-error" : ""}
                      />
                      {formErrors.phone && <span className="error-msg">{formErrors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={formErrors.email ? 'input-error' : ''}
                      />
                      {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message / Cargo Details</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      placeholder="Tell us about the weight, dimensions, and destination of your cargo..."
                      value={formData.message}
                      onChange={handleChange}
                      className={formErrors.message ? 'input-error' : ''}
                    />
                    {formErrors.message && <span className="error-msg">{formErrors.message}</span>}
                  </div>

                  <button type="submit" className="btn-primary form-submit">
                    Get Your Quote →
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="advanced-footer">
          <div className="footer-action-bar animate-on-scroll">
            <div className="action-item">
              <div className="action-icon">📞</div>
              <div className="action-text">
                <h4>Call Us</h4>
                <p>+91 93279 61075</p>
              </div>
            </div>
            <div className="action-item border-left-right">
              <div className="action-icon">✉️</div>
              <div className="action-text">
                <h4>Email Support</h4>
                <p>rohtash@deepaklogistics.com</p>
              </div>
            </div>
            <div className="action-item">
              <div className="action-icon">⚡</div>
              <div className="action-text">
                <h4>Quick Quote</h4>
                <p>Get timely quotes for your shipping needs</p>
              </div>
            </div>
          </div>

          <div className="footer-main">
            <div className="footer-col about-col">
              <div className="footer-brand">
                <img src={logoImg} alt="Deepak Logistics Logo" className="footer-logo" />
                <h3>DEEPAK <span>LOGISTICS</span></h3>
              </div>
              <p>
                A team of logistics and transportation management professionals you can trust.
                India's best transport system — safe, reliable, efficient, and built for your supply chain needs.
              </p>
            </div>

            <div className="footer-col links-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Our Services</a></li>
                <li><a href="#branches">Branch List</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            <div className="footer-col contact-col">
              <h4>Contact Info</h4>
              <ul className="contact-list">
                <li>
                  <span className="c-icon">📞</span>
                  <div className="c-details">
                    <strong>Call Us</strong>
                    <span>+91 93279 61075</span><br />
                    <span>+91 87802 60546</span>
                  </div>
                </li>
                <li>
                  <span className="c-icon">✉️</span>
                  <div className="c-details">
                    <strong>Email</strong>
                    <span>info@deepaklogistics.com</span>
                  </div>
                </li>
                <li>
                  <span className="c-icon">📍</span>
                  <div className="c-details">
                    <strong>Head Office</strong>
                    <span>H O 25, Sohang Residency, Behind Akash Metro City, Isanpur, Ahmedabad – 382427</span>
                  </div>
                </li>
                {/* <li>
                <span className="c-icon">🕒</span>
                <div className="c-details">
                  <strong>Working Hours</strong>
                  <span>Monday – Saturday<br />10:00 AM – 6:00 PM</span>
                </div>
              </li> */}
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>&copy; {new Date().getFullYear()} Deepak Logistics. All Rights Reserved.</p>
            <div className="footer-bottom-links">
              <a href="#home">Privacy Policy</a>
              <a href="#home">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  export default App;
