import React, { createContext, useState } from "react";

export const SideBarData = createContext();

const SideBarContext = ({ children }) => {
  const [data, setData] = useState('dashboard'); // Default to 'dashboard'

  const setSidebarData = (newData) => {
    setData(newData);
    console.log("Sidebar data updated:", newData);
  }

  return (
    <SideBarData.Provider value={{ data, setSidebarData }}>
      {children}
    </SideBarData.Provider>
  );
};

export default SideBarContext;
