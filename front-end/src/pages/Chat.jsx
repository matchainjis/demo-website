import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { allUserRoute, host } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";
import { Hooks } from "@matchain/matchid-sdk-react";
import { useSelector } from "react-redux";

function Chat() {
  const location = useLocation();
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  const sign_in_user = useSelector((state) => state.authReducer.sign_in_user);
  const { username, address } = location.state || {}; // Fallback if state is undefined
  const { useUserInfo, useWallet, useMatchEvents } = Hooks;

  const {
    login,
    logout,
    isLogin,
    // username,
    getLoginEmailCode,
    refreshOverview,
  } = useUserInfo();

  const {
    initWallet,
    generateWallet,
    isRecovered,
    recoveryWallet,
    signMessage,
    signTransaction,
    // address,
    evmAccount,
  } = useWallet();

  // Check if a user exists in localStorage and set the current user
  useEffect(() => {
    const fetchUser = async () => {
      // Retrieve stored data from localStorage
      const userData = localStorage.getItem("chat-app-user");
      const userTokenData = localStorage.getItem("chat-app-user-data");
      const userMongoData = localStorage.getItem("chat-app-user-mongo");
      // Parse JSON safely (handle missing values)
      const parsedUser = userData ? await JSON.parse(userData) : {};
      const parsedUserToken = userTokenData
        ? await JSON.parse(userTokenData)
        : {};
      const parsedUserMongo = userMongoData
        ? await JSON.parse(userMongoData)
        : {};
      // Merge all objects into one
      const mergedUser = {
        ...parsedUser, // Includes mid, token, did, isLogin, username, address, etc.
        ...parsedUserToken, // Includes token from MatchID
        ...parsedUserMongo, // Includes additional user info from MongoDB (email, avatar, etc.)
      };
      if (
        !localStorage.getItem("chat-app-user") ||
        !localStorage.getItem(
          "chat-app-user-data" || !localStorage.getItem("chat-app-user-mongo"),
        )
      ) {
        navigate("/login");
      } else {
        // const storedUser = await JSON.parse(
        //   localStorage.getItem("chat-app-user"),
        // );
        setCurrentUser(mergedUser);
        setIsLoaded(true);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      // socket.current.emit(
      //   "add-user",
      //   `${currentUser.address}${currentUser.username}`,
      // );
      socket.current.emit("add-user", `${currentUser.address}`);
    }
  }, [currentUser]);
  // useEffect(() => {
  //   if (sign_in_user) {
  //     console.log(sign_in_user);
  //     socket.current = io(host);
  //     socket.current.emit(
  //       "add-user",
  //       `${sign_in_user.address}${sign_in_user.username}`,
  //     );
  //   }
  // }, [sign_in_user]);

  // Fetch contacts for the current user if the avatar is set
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            const { data } = await axios.get(
              `${allUserRoute}/${currentUser.address}`,
            );
            setContacts(data);
          } catch (error) {
            console.error("Failed to fetch contacts:", error);
          }
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);
  // useEffect(() => {
  //   const fetchContacts = async () => {
  //     if (sign_in_user) {
  //       console.log(sign_in_user);
  //       if (sign_in_user.isAvatarImageSet) {
  //         try {
  //           const { data } = await axios.get(
  //             `${allUserRoute}/${sign_in_user.address}`,
  //           );
  //           setContacts(data);
  //         } catch (error) {
  //           console.error("Failed to fetch contacts:", error);
  //         }
  //       } else {
  //         navigate("/setAvatar");
  //       }
  //     }
  //   };
  //   fetchContacts();
  // }, [sign_in_user, navigate]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          // currentUser={sign_in_user}
          changeChat={handleChatChange}
        />
        {isLoaded && currentChat === undefined ? (
          // <Welcome currentUser={currentUser} />
          <Welcome currentUser={sign_in_user} />
        ) : (
          <ChatContainer
            currentChat={currentChat}
            currentUser={currentUser}
            // currentUser={sign_in_user}
            socket={socket}
          />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;

  .container {
    height: 90vh;
    width: 90vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;

    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;
