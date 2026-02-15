import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import FilmDetails from "./pages/FilmDetails";
import ActorDetails from "./pages/ActorDetails";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Sakila App</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/film/:id" element={<FilmDetails />} />
        <Route path="/actor/:id" element={<ActorDetails />} />
      </Routes>
    </BrowserRouter>
  );
}