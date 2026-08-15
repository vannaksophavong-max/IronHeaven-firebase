import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import BackBar from "../components/BackBar";
import Footer from "../components/Footer";
import BikeCard from "../components/BikeCard";
import { getBikeById, getAllBikes } from "../firebase/bikes";

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike] = useState(undefined); // undefined = loading, null = not found
  const [relatedBikes, setRelatedBikes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setBike(undefined);

    (async () => {
      // Bikes are stored with their readable id as the Firestore doc id.
      const found = await getBikeById(id);
      if (cancelled) return;

      if (!found) {
        setBike(null);
        return;
      }

      setBike(found);
      document.title = `${found.name} — IronHeaven`;

      // No manual "related" list from the admin form — just show a few
      // other bikes, preferring the same category.
      const all = await getAllBikes();
      if (cancelled) return;
      const others = all.filter((b) => (b.docId || b.id) !== id);
      const sameCategory = others.filter((b) => b.category === found.category);
      const rest = others.filter((b) => b.category !== found.category);
      setRelatedBikes([...sameCategory, ...rest].slice(0, 3));
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (bike === null) {
    return <Navigate to="/explore" replace />;
  }

  if (bike === undefined) {
    return <p style={{ padding: "6rem 1.5rem", color: "#fff" }}>Loading...</p>;
  }

  return (
    <div className="detail-page">
      <BackBar to="/explore" label="Back to Collection" />

      <section
        className="detail-hero"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("${bike.heroImage}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="detail-hero-inner">
          <div className="detail-badge">{bike.badge}</div>
          <h1>{bike.name}</h1>
          <p>{bike.tagline}</p>
          <div className="detail-price-row">
            <span className="detail-price">{bike.price}</span>
          </div>
        </div>
      </section>

      <section className="detail-body">
        <div className="detail-container">
          <div className="detail-description">
            <h2>About This Bike</h2>
            <p>{bike.description}</p>
          </div>

          {bike.specs?.length > 0 && (
            <div className="detail-specs">
              <h2>Specifications</h2>
              <table className="specs-table">
                <tbody>
                  {bike.specs.map(({ label, value }) => (
                    <tr key={label}>
                      <td className="spec-label">{label}</td>
                      <td className="spec-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {bike.features?.length > 0 && (
            <div className="detail-features">
              <h2>Key Features</h2>
              <ul className="features-list">
                {bike.features.map((feature) => (
                  <li key={feature}>
                    <span className="material-symbols-outlined">check_circle</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {relatedBikes.length > 0 && (
        <section className="related-section">
          <div className="related-container">
            <h2>You Might Also Like</h2>
            <div className="related-grid">
              {relatedBikes.map((relatedBike) => (
                <BikeCard key={relatedBike.docId || relatedBike.id} bike={relatedBike} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
