import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            🚀 University Smart Parking System
          </div>
          <h1>
            Smarter Parking,{" "}
            <span className="hero-gradient">Less Hassle</span>
          </h1>
          <p className="hero-description">
            Find, reserve, and manage parking spots across campus in seconds.
            Real-time availability, instant booking, and powerful admin tools.
          </p>
          <div className="hero-buttons">
            <Link href="/register" className="hero-btn-primary">
              Get Started →
            </Link>
            <Link href="/login" className="hero-btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Everything You Need</h2>
        <p>Powerful features to make campus parking effortless.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Real-Time Availability</h3>
            <p>
              View which parking zones and slots are available right now. No
              more circling the lot looking for a spot.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Easy Reservations</h3>
            <p>
              Book a parking slot in advance with your vehicle plate number.
              Cancel anytime if plans change.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏗️</div>
            <h3>Zone Management</h3>
            <p>
              Admins and staff can create and manage parking zones with
              locations, descriptions, and slot counts.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Role-Based Access</h3>
            <p>
              Three user roles — Admin, Staff, and Student — each with
              tailored permissions and dashboards.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Usage Reports</h3>
            <p>
              Admin dashboard with occupancy rates, reservation trends, and
              zone-level usage analytics.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>
              Built with Next.js for blazing-fast page loads and a smooth,
              responsive user experience.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
