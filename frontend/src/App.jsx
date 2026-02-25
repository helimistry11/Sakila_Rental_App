import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import FilmDetails from "./pages/FilmDetails";
import FilmsPage from "./pages/FilmsPage";
import ActorDetails from "./pages/ActorDetails";
import Customers from "./pages/Customers";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Home</Link>
          <a className="navbar-brand" href="/customers">Customers</a>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/films" element={<FilmsPage />} />
        <Route path="/film/:id" element={<FilmDetails />} />
        <Route path="/actor/:id" element={<ActorDetails />} />
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </BrowserRouter>
  );
}