import "./Chatwindow.css";
import Chat from "./Chat";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "../MyContext";
import { BeatLoader } from "react-spinners";
import Vapi from "@vapi-ai/web";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../Firebase";
import { useNavigate } from "react-router-dom";

const auth = getAuth(app);

function Chatwindow() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);

      // clear token from localStorage
      localStorage.removeItem("token");
      console.log("User signed out successfully");
      navigate("/"); // redirect to landing page
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  //vapi Integration
  const vapiRef = useRef(null);
  const [isVapiActive, setIsVapiActive] = useState(false);

  const vapistart = async () => {
    if (vapiRef.current && isVapiActive) {
      try {
        if (typeof vapiRef.current.stop === "function")
          await vapiRef.current.stop();
        else if (typeof vapiRef.current.end === "function")
          await vapiRef.current.end();
        else if (typeof vapiRef.current.close === "function")
          await vapiRef.current.close();
      } catch (err) {
        console.warn("Error stopping Vapi:", err);
      } finally {
        setIsVapiActive(false);
        vapiRef.current = null;
      }
      return;
    }

    try {
      const vapi = new Vapi("5b0c88e0-042c-44a9-a890-df75e96273fe");
      vapiRef.current = vapi;

      await vapi.start("ca5f245a-378d-41d2-8eaa-1bd835f16ac6");
      setIsVapiActive(true);

      vapi.on("call-start", () => {
        console.log("Call started");
        setIsVapiActive(true);
      });

      vapi.on("call-end", () => {
        console.log("Call ended");
        setIsVapiActive(false);

        vapiRef.current = null;
      });

      vapi.on("message", (message) => {
        if (message.type === "transcript") {
          console.log(`${message.role}: ${message.transcript}`);
        }
      });

      vapi.on("error", (err) => {
        console.error("Vapi error:", err);
        setIsVapiActive(false);
        vapiRef.current = null;
      });
    } catch (err) {
      console.error("Failed to start Vapi:", err);
      setIsVapiActive(false);
      vapiRef.current = null;
    }
  };

  //vapi Ended!

  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getReply = async () => {
    if (!prompt.trim()) return;
    setNewChat(false);
    setLoading(true);
    let token = localStorage.getItem("token");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      let response = await fetch("http://localhost:8080/api/chat", options);

      if (response.status !== 200) {
        console.log("Error in fetching the data", response);
        return;
      }

      let res = await response.json();
      setReply(res.reply);
    } catch (err) {
      console.log("Error : ", err.message);
    }
    setLoading(false);
  };

  // append new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => {
        return [
          ...prevChats,
          { role: "user", content: prompt },
          { role: "assistant", content: reply },
        ];
      });
    }

    setPrompt("");
  }, [reply]);

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          GemiSeek <i className="fa-solid fa-chevron-down"></i>
        </span>

        <div
          className="userIconDiv"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Settings
          </div>

          <div className="dropDownItem" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}
      <Chat></Chat>

      <BeatLoader color="#fff" loading={loading}></BeatLoader>

      <div className="chatInput">
        <div className="inputBox">
          <textarea
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                getReply();
              }
            }}
          ></textarea>

          <div id="submit" onClick={getReply} style={{ marginRight: "60px" }}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>

          <div
            className={`voice-wrapper ${isVapiActive ? "active" : ""}`}
            onClick={vapistart}
          >
            <div className="voice-circle">
              <i className="fa-solid fa-microphone"></i>
            </div>
          </div>
        </div>

        <p className="info">
          GemiSeek can make mistakes. Check important info. See Cookie
          Preferences.
        </p>
      </div>
    </div>
  );
}

export default Chatwindow;
