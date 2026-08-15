import { Link } from "react-router-dom";

export default function BackBar({ to, label }) {
  return (
    <div className="back-bar">
      <Link to={to} className="back-link">
        <span className="material-symbols-outlined">arrow_back</span>
        {label}
      </Link>
    </div>
  );
}
