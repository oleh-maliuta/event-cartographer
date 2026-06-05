import { MessageStates } from "../constants";

/**
 * Creates a new message list state.
 * @param {string} mode - message mode (success, error, info)
 * @param {Array<string>} list - list of messages
 * @returns 
 */
export const messageListState = (mode = MessageStates.SUCCESS, list = []) => ({mode, list});

export function messageListReducer(state, action) {
    switch (action.type) {
        case 'SET_MESSAGES':
            return messageListState(action.payload.mode, action.payload.list);
        case 'CLEAR_MESSAGES':
            return messageListState();
        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}
