// import Flow from '../Flow';
import FlowStart from './Components/FlowStart';
import IntroDivider from './Components/Createdcards';
import ChatBotApp from './Components/chatbot';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="flow"   element={<FlowStart />} />
        <Route path="/bot" element={<ChatBotApp />} />
        <Route path="/intro" element={<IntroDivider />} />
      {/* <Route path="*" element={<NoPage />} /> */}
      </Routes>
    </BrowserRouter>
    // <div className="App">
    //   <header className="App-header">Gen AI Agent Builder for Enterprise Application</header>
    //   {/* <Flow /> */}
    //   <Flow />
    // </div>
  );
}

export default App;
