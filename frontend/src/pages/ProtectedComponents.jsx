import React, { useContext, useEffect, useState } from "react";
// import { UserDataContext } from "../context/Usercontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedComponent = ({ children }) => {
//   const { user, setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Check if user is authenticated, mostly check if the token is present or not, in local storage
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
    setIsLoading(false);
  }, [token, navigate]);

  // checking the token is valid (correct) or not
  // useEffect(() => {
  //   axios
  //     .get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((response) => {
  //       console.log("Profile fetched:", response.data);
  //       setIsLoading(false);
  //       // setUser(response.data.user);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching profile:", error);
  //       localStorage.removeItem("token");
  //       navigate("/login");
  //     });
  // }, [token, navigate, setUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedComponent;
