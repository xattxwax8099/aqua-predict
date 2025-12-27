import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import WaterQualityPrediction from "./WaterQualityPrediction";
import "./App.css";

function AquaSightLanding() {
  return (
    <div className="map-container">
      <div className="floating-ui">
        <Link to="/prediction" className="prediction-btn">
          Prediction Water Quality
        </Link>
      </div>

      <iframe
        title="AquaSight GEE"
        src="https://soy-coast-469612-d5.projects.earthengine.app/view/aqua-sight"
        className="full-screen-iframe"
        loading="lazy"
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AquaSightLanding />} />
        <Route path="/prediction" element={<WaterQualityPrediction />} />
      </Routes>
    </Router>
  );
}
