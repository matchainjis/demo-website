import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import logo from "../assets/logo.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Hooks, Components } from "@matchain/matchid-sdk-react";
import axios from "axios";
import { registerOrFindUserRoute } from "../utils/APIRoutes";
import { useDispatch, useSelector } from "react-redux";
import {
  setEmail,
  setVerificationCode,
  setIsEmailModalOpened,
  setIsUsernameModalOpened,
  setIsCodeSent,
  setLoading,
  signInAccount,
} from "../redux/authReducer/action";

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
    loginByEmail,
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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(true); // State for email modal
  const [loginData, setLoginData] = useState(); // State for email modal
  const emailInputRef = useRef(null); // useRef for email input
  const navigate = useNavigate();
  const hasLoggedInOnce = useRef(false);

  const dispatch = useDispatch();

  const {
    email,
    verificationCode,
    isEmailModalOpened,
    isUsernameModalOpened,
    isCodeSent,
    loading,
  } = useSelector((state) => state.authReducer); // Get stored user info from Redux
  const sign_in_user = useSelector((state) => state.authReducer.sign_in_user);

  // Listen for login/logout events from MatchID SDK
  useMatchEvents({
    onLogin: async (data) => {
      console.log("User logged in:", data);
      setLoginData(data);
      // Fetch the latest user data after login
      await refreshOverview();
      // ✅ Check if username is empty after refreshOverview()

      const loggedUser = {
        mid: data.mid || "",
        token: data.token || "",
        did: data.did || "",
        isLogin: true,
        email,
        username: username || "",
        address: evmAccount?.address || address || "",
      };

      // Save user data in Redux
      dispatch(signInAccount(loggedUser));
      if (!username) {
        setIsUsernameModalOpen(true);
        dispatch(setIsUsernameModalOpened(true));
      } else {
        toast.success("Logged in successfully!");
        navigate("/chat"); // Redirect to chat
        dispatch(setLoading(false));
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
    if (isLogin && Object.keys(sign_in_user).length > 0) {
      hasLoggedInOnce.current = true;
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

        console.log(userInfo);
        console.log(sign_in_user);
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
            dispatch(setIsUsernameModalOpened(true));
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

  const handleEmailLogin = async () => {
    if (!email) {
      toast.error("Please enter your email!");
      return;
    }
    try {
      dispatch(setLoading(true));
      const loginEmailCodeResponseObject = await getLoginEmailCode(email);
      console.log(loginEmailCodeResponseObject);
      dispatch(setIsCodeSent(true));
      toast.success(`Verification code sent to ${email}`);
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      dispatch(setLoading(false));
    }
    // console.log("Logged in with email:", email);
    // toast.success(`Logged in with email: ${email}`);
    // setIsEmailModalOpen(false); // Close the modal after login
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

    // console.log(sign_in_user);
    console.log(userInfo);

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
        dispatch(setIsUsernameModalOpened(true));
      } else {
        navigate("/chat");
      }
    } catch (error) {
      console.error("❌ Error checking/registering user:", error);
    }
  };

  // Handle verifying the email with the code
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code!");
      return;
    }

    try {
      dispatch(setLoading(true));
      const loginByEmailResponseObject = await loginByEmail({
        email,
        code: verificationCode,
      });
      console.log(loginByEmailResponseObject);
      toast.success("Email verified successfully!");
      dispatch(setIsEmailModalOpen(false));
      setIsEmailModalOpen(false); // Close the modal after verification
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const labels = document.querySelectorAll(".matchid-field-label");

          labels.forEach((label) => {
            if (label.innerText.trim() === "Email Address") {
              const emailInput = label
                .closest(".matchid-field-box")
                ?.querySelector(".matchid-input-field");

              if (emailInput) {
                emailInputRef.current = emailInput;

                // 🧠 DO NOT add input listeners or set values manually

                const continueBtn = document.querySelector(
                  "button.matchid-btn-highlight.matchid-btn-lg",
                );

                if (continueBtn) {
                  continueBtn.addEventListener("click", () => {
                    const email = emailInputRef.current?.value || "";
                    console.log("✅ Email captured on Continue:", email);
                    dispatch(setEmail(email));
                  });
                }

                observer.disconnect();
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    const errorObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          const errorEl = document.querySelector(".matchid-field-error");

          // Handle "Verification code sent too frequently"
          if (
            errorEl &&
            errorEl.textContent?.includes(
              "Verification code sent too frequently",
            )
          ) {
            console.log("🚫 Hiding error: ", errorEl.textContent);
            errorEl.style.display = "none";
          }

          // Handle "Request Error"
          const errorText = errorEl?.textContent;
          if (errorText === "Request Error") {
            console.log("⚠️ Rewriting error message for unstable network");
            errorEl.textContent = "Network unstable, try again later.";
          }

          // Replace "Failed to send code: Request Error"
          if (errorText === "Failed to send code: Request Error") {
            console.log("⚠️ Rewriting error message for unstable network");
            errorEl.textContent =
              "Failed to send code: Network unstable, try again later.";
          }
        }
      }
    });

    errorObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      errorObserver.disconnect();
    };
  }, []);

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
          {/* <h2>Login With MatchID</h2> */}
          {/* Replace custom login buttons with LoginBox */}
          {/* <LoginBox
            methods={
              [
                // "telegram",
                // "twitter",
                // "discord",
                // "github",
                // "linkedin",
                // "facebook",
                // "youtube",
              ]
            } // Customize login methods to display
            // recommendMethods={["wallet", "email", "google"]} // Highlight recommended methods
            recommendMethods={["email"]} // Highlight recommended methods
            inModal={true} // Do not display in modal (optional)
          /> */}
          {/* </form> */}
          <ToastContainer />
          {/* Email Login Modal */}
          <EmailModal
            isOpen={isEmailModalOpen}
            // isOpen={isEmailModalOpened}
            width={380}
            onClose={() => {
              console.log("Modal closed");
              setIsEmailModalOpen(false);
              dispatch(setIsEmailModalOpened(false));
            }}
            onBack={() => {
              console.log("Back button clicked");
              setIsEmailModalOpen(false);
              dispatch(setIsEmailModalOpened(false));
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
          {/* Verification Code Input (Shown after code is sent) */}
          {isCodeSent && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => dispatch(setVerificationCode(e.target.value))}
                className="w-full border p-2 rounded-lg"
              />
              <button
                onClick={handleVerifyCode}
                className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          )}
          {/* Username Modal (Opens after Password Modal is set successfully) */}
          <UsernameModal
            isOpen={isUsernameModalOpen}
            // isOpen={isUsernameModalOpened}
            onClose={() => {
              setIsUsernameModalOpen(false);
              dispatch(setIsUsernameModalOpened(false));
            }}
            onBack={() => {
              console.log("Back button clicked in username modal");
              setIsUsernameModalOpen(false);
              dispatch(setIsUsernameModalOpened(false));
            }}
            onChange={(e) => {
              setUsernameInput(e.target.value);
              dispatch(setVerificationCode(e.target.value));
            }} // Capture input value
            onSuccess={() => {
              toast.success("Username set successfully!");
              handleUsernameSetSuccess();
              setIsUsernameModalOpen(false);
              dispatch(setIsUsernameModalOpened(false));
            }}
          />
          {/* Username Modal (Opens if user has no username) */}
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
