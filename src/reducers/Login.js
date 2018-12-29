/**
 * Created by chenlizan on 2017/7/22.
 */

import {handleActions} from "redux-actions";

const initState = {
    account: {}
};

const reducer = handleActions({
    SAVE_LOGIN_INFO: (state, action) => ({
        ...state, account: action.payload
    })
}, initState);

export default {initState, reducer};
