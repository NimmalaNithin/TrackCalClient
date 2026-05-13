import React from "react";
import { createContext, useContext, useState } from "react";

const BreadCrumbContext = createContext();

export const BreadCrumbProvider = ({ children }) => {
  const [breadCrumbTitle, setBreadCrumbTitleState] = useState(()=>{
    return localStorage.getItem("breadCrumbTitle") || "Overview";
  })

  const setBreadCrumbTitle = (title) => {
    setBreadCrumbTitleState(title);
    localStorage.setItem("breadCrumbTitle",title);
  }
  
  return (
    <BreadCrumbContext.Provider value={{ breadCrumbTitle, setBreadCrumbTitle }}>
      {children}
    </BreadCrumbContext.Provider>
  );
};

export const useBreadCrumb = () => useContext(BreadCrumbContext);
