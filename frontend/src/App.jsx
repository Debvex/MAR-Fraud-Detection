import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { SideBarData } from "./context/SideBarContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { Toaster } from "react-hot-toast";
import ProtectedComponent from "./pages/ProtectedComponents";

export default function App() {
  return (
    <>
      <div>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedComponent>
                <Home />
              </ProtectedComponent>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </>
  );
}
