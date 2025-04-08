import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { Provider } from 'react-redux'
import store from './LocalStore/store'
import "./index.css";

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </StrictMode>,
  document.getElementById("root") as HTMLElement
);
// npm install @reduxjs/toolkit react-redux