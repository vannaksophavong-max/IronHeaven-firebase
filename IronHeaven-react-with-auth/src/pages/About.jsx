import { Link } from "react-router-dom";
import BackBar from "../components/BackBar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <BackBar to="/" label="Back to Home" />

      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">Our Story</span>
          <h1>
            Built for the Road.
            <br />
            Forged in Iron.
          </h1>
        </div>
      </section>

      <section className="about-moto">
        <div className="about-container">
          <div className="moto-block">
            <h2>Our Moto</h2>
            <p className="moto-quote">"Ride Hard. Live Free."</p>
            <p>
              IronHeaven was born from a simple belief: motorcycles aren't
              just machines — they are a way of life. We started as a small
              group of riders who were tired of settling for ordinary. Every
              curve of the road, every roar of the engine, every open
              horizon called us to build something worthy of the rider's
              spirit.
            </p>
            <p>
              We are not a brand. We are a brotherhood. Every piece we carry
              is hand-selected for those who demand authenticity — riders
              who know the difference between a bike that moves and a bike
              that speaks to the soul.
            </p>
            <p>
              At IronHeaven, we don't just sell motorcycles and gear. We
              serve a community of people who believe freedom is not a
              destination — it's the ride itself.
            </p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <span className="material-symbols-outlined">bolt</span>
              <h3>Performance</h3>
              <p>
                Every machine we stand behind is engineered to push
                boundaries and handle whatever the road demands.
              </p>
            </div>
            <div className="value-card">
              <span className="material-symbols-outlined">shield</span>
              <h3>Reliability</h3>
              <p>
                We only carry gear and bikes we'd trust with our own lives.
                No compromises, ever.
              </p>
            </div>
            <div className="value-card">
              <span className="material-symbols-outlined">handshake</span>
              <h3>Community</h3>
              <p>
                IronHeaven is built on real connections between real riders.
                When you join us, you join a family.
              </p>
            </div>
            <div className="value-card">
              <span className="material-symbols-outlined">explore</span>
              <h3>Freedom</h3>
              <p>
                We exist to get more people out on the open road — and to
                make sure they love every mile of it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to ride?</h2>
        <p>Explore our collection and find your machine.</p>
        <Link to="/explore">
          <button className="cta-btn">Explore Now</button>
        </Link>
      </section>

      <Footer />
    </>
  );
}
