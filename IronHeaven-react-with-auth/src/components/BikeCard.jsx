import { Link } from "react-router-dom";

export default function BikeCard({ bike }) {
  const hasImageClass = Boolean(bike.image);

  return (
    <div
      className="bike-card"
      data-category={bike.category}
      style={{ animation: "fadeIn 0.3s ease" }}
    >
      <div
        className={`bike-img ${hasImageClass ? bike.image : ""}`}
        style={
          !hasImageClass && bike.heroImage
            ? {
              backgroundImage: `url("${bike.heroImage}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
            : undefined
        }
      ></div>
      <div className="bike-info">
        <span className="bike-tag">{bike.badge}</span>
        <h3>{bike.name}</h3>
        <p>{bike.tagline}</p>
        <div className="bike-footer">
          <span className="bike-price">{bike.price}</span>
          <Link to={`/bikes/${bike.id}`}>
            <button className="enquire-btn">Detail</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
