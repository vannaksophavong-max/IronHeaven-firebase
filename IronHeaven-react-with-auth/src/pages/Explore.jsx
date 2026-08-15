import { useEffect, useState } from "react";
import BackBar from "../components/BackBar";
import Footer from "../components/Footer";
import BikeCard from "../components/BikeCard";
import { getAllBikes } from "../firebase/bikes";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "cruiser", label: "Cruiser" },
  { key: "sport", label: "Sport" },
  { key: "adventure", label: "Adventure" },
];

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [allBikes, setAllBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setAllBikes(await getAllBikes());
      setLoading(false);
    })();
  }, []);

  const visibleBikes = allBikes.filter(
    (bike) => activeFilter === "all" || bike.category === activeFilter
  );

  return (
    <>
      <BackBar to="/" label="Back to Home" />

      <section className="explore-hero">
        <div className="explore-hero-content">
          <span className="about-eyebrow">Our Collection</span>
          <h1>Find Your Ride</h1>
          <p>Hand-picked machines for every kind of rider.</p>
        </div>
      </section>

      <section className="explore-section">
        <div className="explore-container">
          <div className="filter-tabs">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                className={`filter-btn ${activeFilter === filter.key ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: "#fff" }}>Loading...</p>
          ) : (
            <div className="bikes-grid" id="bikes-grid">
              {visibleBikes.map((bike) => (
                <BikeCard key={bike.docId || bike.id} bike={bike} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
