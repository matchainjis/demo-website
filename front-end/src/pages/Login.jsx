import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import logo from "../assets/logo.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Hooks, Components } from "@matchain/matchid-sdk-react";
import axios from "axios";
import { registerOrFindUserRoute } from "../utils/APIRoutes";

function Login() {
  const { useUserInfo, useWallet, useMatchEvents } = Hooks;
  const { EmailModal, LoginBox, UsernameModal } = Components;

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

  const [usernameInput, setUsernameInput] = useState(""); // Store the entered username
  const [emailInput, setEmailInput] = useState(""); // Store the entered email
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false); // Username modal closed initially
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); // State for email modal
  const [loginData, setLoginData] = useState(); // State for email modal
  const navigate = useNavigate();

  // Listen for login/logout events from MatchID SDK
  useMatchEvents({
    onLogin: async (data) => {
      // console.log("User logged in:", data);
      setLoginData(data);
      // Fetch the latest user data after login
      await refreshOverview();
      // ✅ Check if username is empty after refreshOverview()
      if (!username) {
        setIsUsernameModalOpen(true);
      } else {
        toast.success("Logged in successfully!");
        navigate("/chat"); // Redirect to chat
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
    if (isLogin) {
      const handleLogin = async () => {
        await refreshOverview();
        const userData = localStorage.getItem("chat-app-user-data");
        const userMongoData = localStorage.getItem("chat-app-user-mongo");

        // Parse the data if it exists
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const parsedUserMongoData = userMongoData
          ? JSON.parse(userMongoData)
          : null;
        // Fetch additional user information
        const userInfo = {
          mid: loginData?.mid || parsedUserData?.mid || "", // Default empty if undefined
          token: loginData?.token || parsedUserData?.token || "", // Default empty if undefined
          did: loginData?.did || parsedUserData?.did || "", // Default empty if undefined
          isLogin, // From useUserInfo
          username: username || parsedUserMongoData?.username || "", // Ensure username exists
          address:
            address ||
            evmAccount?.address ||
            parsedUserMongoData?.address ||
            "", // Ensure address exists
          theWalletAddress:
            address ||
            evmAccount?.address ||
            parsedUserMongoData?.address ||
            "", // Ensure theWalletAddress is included
          email: emailInput || parsedUserMongoData?.email || "", // Ensure email exists
          evmAccount,
        };
        // Save user information in localStorage
        localStorage.setItem("chat-app-user", JSON.stringify(userInfo));

        // console.log(userInfo);
        // console.log(username);
        // console.log(emailInput);
        // console.log(address);

        try {
          // console.log("ok1");
          const response = await axios.post(registerOrFindUserRoute, userInfo);
          // console.log(
          //   "✅ User successfully checked/registered with mongo:",
          //   response.data,
          // );
          // console.log("ok2");
          // Store user info in localStorage
          localStorage.setItem(
            "chat-app-user-mongo",
            JSON.stringify(response.data),
          );
          // console.log("ok3");
          // If username is empty, open the UsernameModal
          if (!response.data.username) {
            // console.log("ok4");
            setIsUsernameModalOpen(true);
          } else {
            // console.log("ok5");
            navigate("/chat");
          }
        } catch (error) {
          console.error("❌ Error checking/registering user:", error);
        }

        navigate("/chat");
      };
      handleLogin();
    }
  }, [isLogin, username, navigate]);

  const handleEmailLogin = (email) => {
    console.log("Logged in with email:", email);
    toast.success(`Logged in with email: ${email}`);
    setIsEmailModalOpen(false); // Close the modal after login
  };

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
      theWalletAddress: address,
      evmAccount, // From useWallet
      email: emailInput,
    };
    console.log("Updated user info:", userInfo);

    localStorage.setItem("chat-app-user", JSON.stringify(userInfo));

    try {
      const response = await axios.post(registerOrFindUserRoute, userInfo);
      // console.log(
      //   "✅ User successfully checked/registered with mongo:",
      //   response.data,
      // );

      // Store user info in localStorage
      localStorage.setItem(
        "chat-app-user-mongo",
        JSON.stringify(response.data),
      );

      // If username is empty, open the UsernameModal
      if (!response.data.username) {
        setIsUsernameModalOpen(true);
      } else {
        navigate("/chat");
      }
    } catch (error) {
      console.error("❌ Error checking/registering user:", error);
    }
  };

  return (
    <>
      <GlobalStyle /> {/* Inject global styles */}
      <Background>
        <Container>
          {/* <form className="login-form"> */}
          <div className="header">
            <img src={logo} alt="logo" className="logo" />
            <LinkButton to="/">
              <h1>MatchID Chat Box</h1>
            </LinkButton>
          </div>
          <h2>Sign In / Sign Up</h2>
          {/* Replace custom login buttons with LoginBox */}
          <LoginBox
            methods={[
              "telegram",
              "twitter",
              "discord",
              "github",
              "linkedin",
              "facebook",
              "youtube",
            ]} // Customize login methods to display
            recommendMethods={["wallet", "email", "google"]} // Highlight recommended methods
            inModal={true} // Do not display in modal (optional)
          />
          {/* </form> */}
          <ToastContainer />
          {/* Email Login Modal */}
          <EmailModal
            isOpen={isEmailModalOpen}
            width={380}
            onClose={() => {
              console.log("Modal closed");
              setIsEmailModalOpen(false);
            }}
            onBack={() => {
              console.log("Back button clicked");
              setIsEmailModalOpen(false);
            }}
            onChange={(e) => setEmailInput(e.target.value)} // Capture input value
            onLogin={handleEmailLogin}
            style={{
              backgroundColor: "rgba(20, 20, 20, 0.9)", // Darker background
              borderRadius: "12px", // Rounded corners
              padding: "20px", // Extra padding inside the modal
              color: "white", // Ensure text is readable
            }}
          />
          {/* Username Modal (Opens after Password Modal is set successfully) */}
          <UsernameModal
            isOpen={isUsernameModalOpen}
            onClose={() => setIsUsernameModalOpen(false)}
            onBack={() => {
              console.log("Back button clicked in username modal");
              setIsUsernameModalOpen(false);
            }}
            onChange={(e) => setUsernameInput(e.target.value)} // Capture input value
            onSuccess={() => {
              toast.success("Username set successfully!");
              handleUsernameSetSuccess();
              setIsUsernameModalOpen(false);
            }}
          />
        </Container>
      </Background>
    </>
  );
}

export default Login;

const Background = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #131324;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 400px;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
  color: white;
  text-align: center;

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;

    .logo {
      height: 90px;
      margin-right: 0.5rem;
      border-radius: 50rem;
    }
  }

  h2 {
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    color: #fc802d;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;

    input {
      padding: 0.8rem;
      border-radius: 5px;
      border: 1px solid #fc802d;
      background-color: transparent;
      color: white;
      font-size: 1rem;

      &:focus {
        outline: none;
        border: 1px solid #997af0;
      }
    }
  }

  button {
    width: 100%;
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

  span {
    font-size: 0.9rem;
    color: #ffffff;
    margin-top: 1rem;

    a {
      color: #fc802d;
      text-decoration: none;
      font-weight: bold;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const LinkButton = styled(Link)`
  padding: 10px 20px;
  // background-color: #FC802D;
  color: white;
  text-decoration: none;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #fc802d;
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
