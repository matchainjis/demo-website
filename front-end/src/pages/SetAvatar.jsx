import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { setAvatarRoute } from "../utils/APIRoutes";
import { Buffer } from "buffer";
import { Hooks, Components } from "@matchain/matchid-sdk-react";

export default function SetAvatar() {
  const api = "https://api.multiavatar.com/45678945";
  const navigate = useNavigate();
  const { useUserInfo, useWallet, useMatchEvents } = Hooks;
  const { PasswordModal, UsernameModal } = Components;
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Password modal closed initially
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false); // Username modal closed initially
  const [loginData, setLoginData] = useState(); // State for email modal
  const [usernameInput, setUsernameInput] = useState(""); // Store the entered username
  const hasRefreshed = useRef(false); // Tracks if refreshOverview has been called

  const {
    login,
    logout,
    isLogin,
    username,
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
    address,
    evmAccount,
  } = useWallet();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }
  }, [isLogin, navigate]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      const userInfo = JSON.parse(localStorage.getItem("chat-app-user"));
      const userInfoMongo = JSON.parse(
        localStorage.getItem("chat-app-user-mongo"),
      );
      // console.log("----");
      console.log(userInfo);
      // console.log(isLogin);
      // console.log(username);
      console.log(userInfoMongo);
      const { data } = await axios.post(
        `${setAvatarRoute}/${userInfo.address}_${userInfo.username}_${userInfoMongo.email}`,
        {
          avatarImage: avatars[selectedAvatar],
        },
      );

      if (data.isSet) {
        // ✅ Update `chat-app-user` in local storage
        const updatedChatAppUser = {
          ...userInfo,
          isAvatarImageSet: true,
          avatarImage: data.image,
        };
        localStorage.setItem(
          "chat-app-user",
          JSON.stringify(updatedChatAppUser),
        );

        // ✅ Update `chat-app-user-mongo` in local storage
        const updatedUserMongo = {
          ...userInfoMongo,
          isAvatarImageSet: true,
          avatarImage: data.image,
          updatedAt: new Date().toISOString(), // ✅ Add/update timestamp
        };
        localStorage.setItem(
          "chat-app-user-mongo",
          JSON.stringify(updatedUserMongo),
        );

        navigate("/Chat", {
          state: { username: username, address: address },
        });
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    }
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      const data = [];
      for (let i = 0; i < 4; i++) {
        const image = await axios.get(
          `${api}/${Math.round(Math.random() * 1000)}`,
        );
        const buffer = new Buffer(image.data);
        data.push(buffer.toString("base64"));
      }
      setAvatars(data);
      setIsLoading(false);
    };

    fetchAvatars();
  }, []);

  // Listen for login/logout events from MatchID SDK
  useMatchEvents({
    onLogin: async (data) => {
      // console.log("User logged in:", data);
      setLoginData(data);
      // Fetch the latest user data after login
      await refreshOverview();
      // ✅ Check if username is empty after refreshOverview()
      // console.log("-----");
      // console.log(username);
      if (!username) {
        setIsUsernameModalOpen(true);
      } else {
        toast.success("Logged in successfully!");
        navigate("/chat", {
          state: { username: username, address: address },
        }); // Redirect to chat
      }
    },
    onLogout: () => {
      console.log("User logged out");
      toast.info("Logged out successfully!");
      localStorage.removeItem("chat-app-user");
      navigate("/"); // Redirect to home
    },
    onBind: async (data) => {
      console.log("User bind:", data);
      // Fetch the latest user data after login
      await refreshOverview();
    },
  });

  useEffect(() => {
    const checkUsername = async () => {
      if (isLogin && !hasRefreshed.current) {
        hasRefreshed.current = true; // ✅ Prevents multiple calls
        await refreshOverview();
        // console.log("----- Username after refresh:");
        // console.log(username);
        if (!username) {
          setIsUsernameModalOpen(true); // Open username modal if not set
        } else {
          toast.success("Logged in successfully!");
          // navigate("/setAvatar"); // Redirect to chat if username is set
        }
      }
      // else navigate("/setAvatar");
    };

    checkUsername(); // Call the async function
  }, [isLogin, navigate, refreshOverview, username]); // ✅ REMOVE `username` and `refreshOverview` from dependencies

  const handleUsernameSetSuccess = async () => {
    // Fetch the latest user data after submitting username
    await refreshOverview();
    // Fetch additional user information
    const userInfo = {
      mid: loginData?.mid ?? "", // Default empty if undefined
      token: loginData?.token ?? "",
      did: loginData?.did ?? "",
      isLogin, // From useUserInfo
      username: usernameInput, // From useUserInfo
      address, // From useWallet
      evmAccount, // From useWallet
    };
    // console.log("Updated user info:", userInfo);

    localStorage.setItem("chat-app-user", JSON.stringify(userInfo));
  };

  return (
    <>
      <GlobalStyle /> {/* Inject global styles */}
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your Profile Picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                style={{ cursor: "pointer" }}
                className={`avatar ${
                  selectedAvatar === index ? "selected" : ""
                }`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img src={`data:image/svg+xml;base64,${avatar}`} alt="avatar" />
              </div>
            ))}
          </div>
          <button className="submit-btn" onClick={setProfilePicture}>
            SET
          </button>
        </Container>
      )}
      <ToastContainer />
      {/* Password Modal (Opens First) */}
      {/* <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onBack={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          console.log("Password set successfully!");
          setIsPasswordModalOpen(false); // Close password modal
          setIsUsernameModalOpen(true); // Open username modal
        }}
      /> */}
      {/* Username Modal (Opens after Password Modal is set successfully) */}
      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onBack={() => {
          console.log("Back button clicked in username modal");
          setIsUsernameModalOpen(false);
        }}
        onSuccess={() => {
          toast.success("Username set successfully!");
          handleUsernameSetSuccess();
          setIsUsernameModalOpen(false);
        }}
      />
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #FC802D
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.3s ease-in-out;

      img {
        height: 6rem;
        transition: 0.3s ease-in-out;
      }

      &.selected {
        border: 0.4rem solid #fc802d;
      }
    }
  }

  .submit-btn {
    width: 25%;
    padding: 0.8rem;
    border-radius: 5px;
    border: none;
    background-color: #fc802d;
    color: white;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      background-color: #997af0;
    }
  }
`;

// Override styles globally
const GlobalStyle = createGlobalStyle`
  .matchid-input-box {
    width: 85% !important;
    max-width: 350px !important;
    margin: 0 auto !important;
  }

  .matchid-input-field {
    width: 100% !important;
    border-radius: 8px !important;
    padding: 10px !important;
    font-size: 16px !important;
    border: none !important;  /* ✅ Remove black border */
    outline: none !important; /* ✅ Remove outline */
    background: none !important;
  }

  .matchid-login-box {
    gap: 2px !important;
  }

  .matchid-login-recommend-list {
    gap: 4px !important;
  }

  .matchid-login-recommend-method {
  }
  
  .matchid-login-recommend-method-item {
    // background-color: #FC802D !important;
    width: 95% !important;
    color: white !important;
    font-weight: bold !important;
    height: 16px !important;
    padding-left: 22px !important;
  }
  
  .matchid-login-recommend-method-popover {
    // background-color: #FC802D !important;
    color: white !important;
  }

  .matchid-login-other {
    gap: 4px !important;
  }

  .matchid-login-other-text {
    padding-top: 10px !important;
  }

  .matchid-login-recommend-wallet-item-icon {
    background-color: #FC802D !important;
  }
`;
