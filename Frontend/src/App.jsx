import { useState } from "react";
import "./App.css";
import Chatwindow from "./components/Chatwindow";
import Sidebar from "./components/Sidebar";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";

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
      <div className="app">
        <MyContext.Provider value={providervalues}>
          <Sidebar />
          <Chatwindow />
        </MyContext.Provider>
      </div>
    </>
  );
}

export default App;
