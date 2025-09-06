import "./Sidebar.css";
import { MyContext } from "../MyContext";
import { useContext, useEffect, useState } from "react";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setPrompt,
    setReply,
    setNewChat,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getAllThreads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/thread", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const res = await response.json();
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setAllThreads(filteredData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const getChat = async (newThreadId) => {
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${newThreadId}`
      );
      const res = await response.json();

      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${threadId}`,
        { method: "DELETE" }
      );
      const res = await response.json();

      //updated threads re-render
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId)
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <section className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="sidebarHeader">
        <img
          src="../src/assets/gptlogo.png"
          alt="gpt logo"
          className="logo"
          onClick={createNewChat}
        ></img>
        <i className="fa-solid fa-bars" onClick={toggleSidebar}></i>
      </button>

      <div onClick={createNewChat} className="newChat">
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
        <span>New Chat</span>
      </div>

      <ul className="history">
        {/* <div style={{ opacity: "0.5", fontSize: "0.85rem", margin: "10px" }}>
          Recent
        </div> */}
        <div className="recent-label">Recent</div>
        {allThreads?.map((thread, idx) => {
          return (
            <li
              key={idx}
              onClick={() => getChat(thread.threadId)}
              className={thread.threadId === currThreadId ? "highlighted" : ""}
            >
              <span className="history-title">{thread.title}</span>
              <i
                className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
              ></i>
            </li>
          );
        })}
      </ul>

      <div className="sign"></div>
    </section>
  );
}

export default Sidebar;
