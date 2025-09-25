import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "../MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);
  const chatEndRef = useRef(null);
  const chatsContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = chatsContainerRef.current;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 20;
    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    const container = chatsContainerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [prevChats, latestReply]);

  // Typing effect
  useEffect(() => {
    if (reply === null) {
      setLatestReply(null);
      return;
    }
    if (!prevChats?.length) return;

    const content = reply.split(" ");

    let idx = 0;
    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));
      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats, reply]);

  return (
    <>
      {newChat && (
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Start a New Chat!
        </h1>
      )}
      <div className="chats" ref={chatsContainerRef}>
        {/* Show all messages except last one */}
        {prevChats?.slice(0, -1).map((chat, idx) => (
          <div
            className={chat.role === "user" ? "userDiv" : "gptDiv"}
            key={idx}
          >
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}

        {prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              <div className="gptDiv" key="non-typing">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="gptDiv" key="typing">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {latestReply}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}

        <div ref={chatEndRef}></div>
      </div>
    </>
  );
}

export default Chat;
