import * as types from "./actionType";

const initialState = {
    sign_up_processing: false,
    sign_up_failed: false,
    sign_up_success: false,
    sign_up_message: "",
    sign_up_user: {},

    sign_in_processing: false,
    sign_in_failed: false,
    sign_in_success: false,
    sign_in_message: "",
    sign_in_user: {},

    user_update_processing: false,
    user_update_success: false,
    user_update_failed: false,
    user_update_message: "",

    email: '',
    verificationCode: '',
    isEmailModalOpen: false,
    isUsernameModalOpen: false,
    isCodeSent: false,
    loading: false,
};

export const reducer = (state = initialState, action) => {

    const { type, payload } = action;
    switch (type) {
        case types.SIGN_UP_REQUEST_PROCESSING:
            return {
                ...state,
                sign_up_processing: true,
                sign_up_failed: false,
                sign_up_success: false,
            };
        case types.SIGN_UP_REQUEST_FAILED:
            return {
                ...state,
                sign_up_processing: false,
                sign_up_failed: true,
                sign_up_success: false,
                sign_up_message: payload
            };
        case types.SIGN_UP_REQUEST_SUCCESS:
            return {
                ...state,
                sign_up_processing: false,
                sign_up_failed: false,
                sign_up_success: true,
                sign_up_message: "Account Successfully Created."
            };

        case types.SIGN_IN_REQUEST_PROCESSING:
            return {
                ...state,
                sign_in_processing: true,
                sign_in_failed: false,
                sign_in_success: false,
            };
        case types.SIGN_IN_REQUEST_FAILED:
            return {
                ...state,
                sign_in_processing: false,
                sign_in_failed: true,
                sign_in_success: false,
                sign_in_message: ""
            };
        case types.SIGN_IN_REQUEST_SUCCESS:
            return {
                ...state,
                sign_in_processing: false,
                sign_in_failed: false,
                sign_in_success: true,
                sign_in_message: "Login successful",
                sign_in_user: payload, // Store MatchID user info here
            };
        case types.LOGOUT_REQUEST:
            return {
                ...state,
                sign_up_processing: false,
                sign_up_failed: false,
                sign_up_success: false,
                sign_up_message: "",
                sign_up_user: {},

                sign_in_processing: false,
                sign_in_failed: false,
                sign_in_success: false,
                sign_in_message: "",
                sign_in_user: {},
            };
        case types.LOGOUT_SUCCESS:
            return {
                ...state,
                logout_processing: false,
                logout_failed: false,
                logout_success: true, // Indicate logout was successful
                logout_message: "Logout Successful", // Success message
                sign_in_user: {}, // Clear user data after logout
                sign_in_message: "", // Clear sign-in message
                sign_in_success: false, // Set sign-in success to false
            };

        case types.LOGOUT_FAILED:
            return {
                ...state,
                logout_processing: false,
                logout_failed: true, // Indicate logout failed
                logout_success: false,
                logout_message: payload || "Logout failed. Please try again.", // Error message
            };

        case types.UPDATE_USER_DATA_REQUEST_PROCESSING:
            return {
                ...state,
                user_update_processing: true,
                user_update_success: false,
                user_update_failed: false,
                user_update_message: "",
            };
        case types.UPDATE_USER_DATA_REQUEST_FAILED:
            return {
                ...state,
                user_update_processing: false,
                user_update_success: false,
                user_update_failed: true,
                user_update_message: payload,
            };
        case types.UPDATE_USER_DATA_REQUEST_SUCCESS:
            return {
                ...state,
                user_update_processing: false,
                user_update_success: true,
                user_update_failed: false,
                user_update_message: payload,
            };
        case types.SET_EMAIL:
            return { ...state, email: action.payload };
        case types.SET_VERIFICATION_CODE:
            return { ...state, verificationCode: action.payload };
        case types.SET_IS_EMAIL_MODAL_OPENED:
            return { ...state, isEmailModalOpened: action.payload };
        case types.SET_IS_USERNAME_MODAL_OPENED:
            return { ...state, isUsernameModalOpened: action.payload };
        case types.SET_IS_CODE_SENT:
            return { ...state, isCodeSent: action.payload };
        case types.SET_LOADING:
            return { ...state, loading: action.payload };
        case types.UPDATE_AVATAR_DETAILS:
            return {
                ...state,
                sign_in_user: {
                    ...state.sign_in_user,
                    isAvatarImageSet: true,
                    avatarImage: action.payload.avatarImage,
                    updatedAt: action.payload.updatedAt,
                },
            };
        default:
            return state;
    }
};