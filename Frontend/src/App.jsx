import { useState } from "react";
import "./App.css";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";
import GemiSeek from "./components/GemiSeek";
import Sidebar from "./components/Sidebar";
import Chatwindow from "./components/Chatwindow";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const providervalues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,
  };
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/chat"
          element={
            <div className="app">
              <MyContext.Provider value={providervalues}>
                <ProtectedRoute>
                  <GemiSeek />
                </ProtectedRoute>
              </MyContext.Provider>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
