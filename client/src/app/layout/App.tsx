import NavBar from "./NavBar";
import { Outlet, ScrollRestoration } from "react-router";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ScrollRestoration />
      <NavBar />
      <div className="max-w-screen-xl mx-auto px-4 pt-20">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
