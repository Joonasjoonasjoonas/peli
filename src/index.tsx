import React from "react";
import ReactDOM from "react-dom/client";
// import { HashRouter } from "react-router-dom"; // only if you actually use routes
import "./fonts.css";   // <- define font first
import "./index.css";   // <- then your main styles
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  // <HashRouter> <App /> </HashRouter>   // use only if you really have routes
  <App />
);