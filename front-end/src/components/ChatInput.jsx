import React, { useState } from "react";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmileFill } from "react-icons/bs";

export default function ChatInput({ handleSendMsg }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msg, setMsg] = useState("");

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState);
  };

  const handleEmojiClick = (emojiData) => {
    const selectedEmoji = emojiData.emoji;
    setMsg((prevMsg) => prevMsg + selectedEmoji);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg.trim());
      setMsg("");
    }
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={toggleEmojiPicker} />
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>
      <form className="input-container" onSubmit={sendChat}>
        <input
          type="text"
          placeholder="Type your message here..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button type="submit" className="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: #080420;
  padding: 1.5rem 1rem;
  border-top: 1px solid #3f3f3f;
  gap: 1rem;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0.8rem;
    gap: 0.5rem;
  }

  @media screen and (max-width: 719px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .button-container {
    display: flex;
    align-items: center;
    color: white;

    .emoji {
      position: relative;

      svg {
        font-size: 1.5rem;
        color: #ffc107;
        cursor: pointer;

        @media screen and (max-width: 719px) {
          font-size: 1.2rem;
        }
      }

      .emoji-picker-container {
        position: absolute;
        bottom: 3rem;
        left: 0;
        z-index: 1000;
        background-color: white;
        box-shadow: 0px 5px 15px rgba(255, 255, 255, 0.2);
        border: 1px solid #808080;
        border-radius: 0.5rem;
        overflow: hidden;

        .emoji-picker-react {
          border: none;
          background-color: #000000;
          color: white;

          .emoji-scroll-wrapper {
            &::-webkit-scrollbar {
              background-color: #000000;
              width: 5px;
            }
            &::-webkit-scrollbar-thumb {
              background-color: #808080;
            }
          }

          .emoji-group {
            button {
              border: 1px solid #808080;
              background-color: transparent;
              filter: contrast(0.9);
              transition: transform 0.2s ease-in-out;

              &:hover {
                transform: scale(1.1);
              }
            }
          }

          .emoji-categories {
            button {
              filter: grayscale(1);
              background-color: transparent;
              border: none;

              &:hover {
                filter: grayscale(0);
              }
            }
          }
        }
      }
    }
  }

  .input-container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 3rem;
    background-color: #1e1e2e;
    padding: 0.5rem 1rem;
    border-radius: 1.5rem;
    gap: 0.5rem;

    @media screen and (max-width: 719px) {
      flex-direction: column;
      height: auto;
      gap: 0.8rem;
    }

    input {
      flex: 1;
      background-color: transparent;
      color: white;
      border: none;
      font-size: 1rem;
      line-height: 1.5rem;

      &::placeholder {
        color: #cccccc;
      }

      &:focus {
        outline: none;
      }

      @media screen and (max-width: 719px) {
        font-size: 0.9rem;
        width: 100%;
      }
    }

    button {
       padding: 0.3rem 1rem;
      border-radius: 1.5rem;
      background-color: #4f04ff;
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.3s ease;
      width: 5rem;
      height: 2rem;
      // margin-bottom: 2rem;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
      }

      svg {
        font-size: 1.2rem;
        color: white;

        @media screen and (max-width: 719px) {
          font-size: 1rem;
        }
      }

      &:hover {
        background-color: #7a64d1;
      }
    }
  }
`;
