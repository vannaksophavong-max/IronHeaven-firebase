import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <section className="hero-section">
        <div className="content">
          <h2>Ride Hard. Live Free.</h2>
          <p>
            IronHeaven is built for those who live for the open road — real
            riders, real machines, real freedom.
          </p>
          <Link to="/explore">
            <button>Explore</button>
          </Link>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-content">
          <h2>Contact Us</h2>
          <p>We'd love to hear from you. Reach out anytime.</p>
          <div className="contact-cards">
            <div className="contact-card">
              <span className="material-symbols-outlined">mail</span>
              <h3>Email</h3>
              <a href="#">ironheaven@gmail.com</a>
            </div>
            <div className="contact-card">
              <span className="material-symbols-outlined">call</span>
              <h3>Phone</h3>
              <a href="#">+855 96 584 275</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
