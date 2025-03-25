import axios from "axios";
import * as types from "./actionType";

const END_POINT = "http://localhost:8080";

//  sign up user / create account
const createAccount = (user) => async (dispatch) => {
    dispatch({ type: types.SIGN_UP_REQUEST_PROCESSING });
    try {
        const result = await axios.post(`${END_POINT}/api/user`, user);

        // remove previous login user info
        localStorage.removeItem('chat-app-login-user-data');

        dispatch({ type: types.SIGN_UP_REQUEST_SUCCESS, payload: result });
    } catch (error) {
        dispatch({ type: types.SIGN_UP_REQUEST_FAILED, payload: error.response.data.error });
    }
};

//  sign up / sign in user with MatchID, no need for a manual API call
const signInAccount = (user) => async (dispatch) => {

    dispatch({ type: types.SIGN_IN_REQUEST_PROCESSING });
    try {
        // const result = await axios.post(`${END_POINT}/api/user/login`, user);

        // save user info in local storage
        localStorage.setItem("chat-app-login-user-data", JSON.stringify(user));
        console.log(user);
        dispatch({ type: types.SIGN_IN_REQUEST_SUCCESS, payload: user });
        dispatch({ type: types.SET_IS_CODE_SENT, payload: true });
    } catch (error) {
        console.log("MatchID Logging Error");
        console.log(error);
        dispatch({ type: types.SIGN_IN_REQUEST_FAILED, payload: error.response.data.error });
    }
};

// logout user using MatchID
const logoutAccount = (logout) => async (dispatch) => {
    dispatch({ type: types.LOGOUT_REQUEST });
    try {
        console.log("🚀 Logging out from MatchID and clearing session...");

        // Step 1: Call the SDK's logout function
        if (logout) {
            await logout(); // Call the logout function provided by MatchID SDK
            console.log("✅ MatchID logout successful");
        } else {
            console.warn("⚠️ Logout function not provided, skipping MatchID logout.");
        }

        // Step 2: Clear Local Storage (MatchID, Wallet, and Chat App)
        localStorage.removeItem('chat-app-login-user-data');
        localStorage.removeItem("match-local");
        localStorage.removeItem("wagmi.store"); // MatchID auth wallet connection
        const reactAppMatchIDAppID = import.meta.env.VITE_MATCH_ID_APP_ID;
        localStorage.removeItem(reactAppMatchIDAppID); // MatchID-specific session
        console.log("✅ Cleared Local Storage");

        // Step 3: Clear Session Storage (MatchID session)
        sessionStorage.clear();
        console.log("✅ Cleared Session Storage");

        // Step 4: Disconnect Wallet (if using MetaMask or other wallets)
        if (window.ethereum) {
            await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
            window.ethereum._state.accounts = []; // Clear wallet accounts manually (if needed)
            console.log("✅ Wallet disconnected (MetaMask/WalletConnect)");
        }

        // Step 5: Dispatch action to reset Redux state
        dispatch({
            type: types.LOGOUT_SUCCESS,
        });

        // Step 6: Redirect to home or show confirmation
        console.log("🚀 Logout completed.");
        window.location.href = "/signin"; // Redirect to home
    } catch (error) {
        console.error("❌ Failed to disconnect MatchID:", error);
        dispatch({
            type: types.LOGOUT_FAILED,
            payload: error.message,
        });
    }
};

// update user data
const updateUserData = (pic, token) => async (dispatch) => {
    dispatch({ type: types.UPDATE_USER_DATA_REQUEST_PROCESSING });
    try {
        const result = await axios.put(`${END_POINT}/api/user`, { pic }, {
            headers: {
                Authorization: "Bearer " + String(token)
            }
        });

        // update information in local storage also
        localStorage.removeItem('chat-app-login-user-data');
        localStorage.setItem("chat-app-login-user-data", JSON.stringify(result.data));
        dispatch({ type: types.UPDATE_USER_DATA_REQUEST_SUCCESS, payload: "User Data Update Successfully." });
    } catch (error) {
        dispatch({ type: types.UPDATE_USER_DATA_REQUEST_FAILED, payload: error.response.data.error });
    }
};


export { createAccount, signInAccount, logoutAccount, updateUserData };

// redux/authReducer/action.js

export const setEmail = (email) => ({
    type: types.SET_EMAIL,
    payload: email,
});

export const setVerificationCode = (code) => ({
    type: types.SET_VERIFICATION_CODE,
    payload: code,
});

export const setIsEmailModalOpened = (isOpen) => ({
    type: types.SET_IS_EMAIL_MODAL_OPENED,
    payload: isOpen,
});

export const setIsUsernameModalOpened = (isOpen) => ({
    type: types.SET_IS_USERNAME_MODAL_OPENED,
    payload: isOpen,
});

export const setIsCodeSent = (isSent) => ({
    type: types.SET_IS_CODE_SENT,
    payload: isSent,
});

export const setLoading = (loading) => ({
    type: types.SET_LOADING,
    payload: loading,
});

export const updateAvatarDetails = (avatarImage) => ({
    type: types.UPDATE_AVATAR_DETAILS,
    payload: {
        avatarImage,
        isAvatarImageSet: true,
        updatedAt: new Date().toISOString(),
    },
});

