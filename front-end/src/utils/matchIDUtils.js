// utils/matchIDUtils.js
export const disconnectMatchID = async (logout) => {
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
        localStorage.removeItem("chat-app-user");
        localStorage.removeItem("chat-app-user-mongo");
        localStorage.removeItem("chat-app-user-data");
        localStorage.removeItem("match-local");
        localStorage.removeItem("wagmi.store"); // MatchID auth wallet connection
        localStorage.removeItem("betanet_app:MID-D-T1..."); // MatchID-specific session
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

        // Step 5: Redirect to home or show confirmation
        console.log("🚀 Logout completed.");
        window.location.href = "/"; // Redirect to home
    } catch (error) {
        console.error("❌ Failed to disconnect MatchID:", error);
    }
};
