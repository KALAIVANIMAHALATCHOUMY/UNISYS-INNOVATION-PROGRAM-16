import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { Provider } from 'react-redux'
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from './LocalStore/store';
import "./index.css";

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  </StrictMode>,
  document.getElementById("root") as HTMLElement
);
// npm install @reduxjs/toolkit react-redux