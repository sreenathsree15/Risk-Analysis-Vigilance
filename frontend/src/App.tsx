import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"
import MapView from "./pages/MapView"
import CasesList from "./pages/CasesList"
import Reports from "./pages/Reports"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<MapView />} />
          <Route path="cases" element={<CasesList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="about" element={
            <div>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p>Vigilance Monitoring System v1.0</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
