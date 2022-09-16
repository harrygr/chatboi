import * as ReactDom from "react-dom/client";
import React from "react";
import { App } from "./App";

const reactContainer = document.querySelector("#⚛️");

if (!reactContainer) {
  throw new Error("No React container present");
}

const root = ReactDom.createRoot(reactContainer);

root.render(<App />);
