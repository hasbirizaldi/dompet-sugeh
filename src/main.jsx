import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Transaction from "./pages/Transaction.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Category from "./pages/Category.jsx";
import DetailTransaction from "./pages/DetailTransaction.jsx";
import NotFound from "./pages/NotFound.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/logout" element={<Logout />} />

          {/* protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="transaction" element={<Transaction />} />
            <Route path="transaction-detail/:trxId" element={<DetailTransaction />} />
            <Route path="print" element={<Dashboard />} />
            <Route path="settings" element={<Dashboard />} />
            <Route path="category" element={<Category />} />
            {/* route not found */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
