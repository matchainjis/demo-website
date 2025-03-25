import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import { getAllMessagesRoute, sendMessageRoute } from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  // console.log(currentChat);
  // console.log(currentUser);
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentUser && currentChat) {
        const response = await axios.post(getAllMessagesRoute, {
          from: currentUser.address,
          // to: currentChat.address,
          to: currentChat._id,
        });
        console.log("Fetched messages:", response.data);
        setMessages(response.data);
      }
    };
    fetchMessages();
  }, [currentUser, currentChat]);

  const handleSendMsg = async (msg) => {
    // console.log(msg, sendMessageRoute, currentUser, currentChat);
    await axios.post(sendMessageRoute, {
      from: currentUser.address,
      // to: currentChat.address,
      to: currentChat._id,
      message: msg,
    });
    socket.current.emit("send-msg", {
      // to: currentChat.address,
      to: currentChat._id,
      from: currentUser.address,
      message: msg,
    });
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h3>{currentChat.username}</h3>
              </div>
              <Logout />
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={uuidv4()} // Generate a unique key for each message
                ref={index === messages.length - 1 ? scrollRef : null} // Attach ref to the last message
              >
                <div
                  className={`message ${
                    message.fromSelf ? "sended" : "received"
                  }`}
                >
                  <div className="content">
                    <p>{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  padding-top: 0rem;
  padding-left: 0rem;
  display: grid;
  grid-template-rows: 10%78%12%;
  gap: 0.1rem;
  overflow: hidden;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%; /* Responsive for mobile devices */
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
  }

  .user-details {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .avatar img {
    height: 3rem;
  }

  .username h3 {
    color: white;
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    /* Styling the scrollbar */
    &::-webkit-scrollbar {
      width: 0.5rem; /* Width of the scrollbar */
    }

    &::-webkit-scrollbar-thumb {
      background-color: #4f04ff; /* Scrollbar thumb color */
      border-radius: 0.5rem; /* Rounded corners */
    }

    &::-webkit-scrollbar-track {
      background-color: #080420; /* Background of the scrollbar track */
    }
  }

  .message {
    display: flex;
    align-items: center;
  }

  .content {
    max-width: 40%;
    overflow-wrap: break-word;
    padding: 1rem;
    font-size: 1.1rem;
    border-radius: 1rem;
    color: #d1d1d1;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }

  .sended {
    justify-content: flex-end;
  }

  .sended .content {
    background-color: #4f04ff21;
  }

  .received {
    justify-content: flex-start;
  }

  .received .content {
    background-color: rgba(188, 187, 190, 0.13);
  }
`;
