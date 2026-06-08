/**
 * Creates a new page navigation state.
 * @param {number} page - current page number
 * @param {number} count - general page count
 * @returns 
 */
export const pageNavigationState = (page = 1, count = 0) => ({page, count});

export function pageNavigationReducer(state, action) {
    switch (action.type) {
        case 'SET_PAGE_NUMBER_AND_COUNT':
            return pageNavigationState(action.payload.page, action.payload.count);
        case 'SET_PAGE_NUMBER':
            return pageNavigationState(action.payload.page, state.count);
        case 'NEXT_PAGE':
            return pageNavigationState(state.page + 1, state.count);
        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}
