import { all, call, put, takeLatest, fork } from "redux-saga/effects"
import {
    LOG_IN_FAILURE,
    LOG_IN_SUCCESS,
    LOG_IN_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAILURE,
    REGISTER_REQUEST
} from "../actions/owner"
import * as userAPI from "../../api/user"

function* logIn(action: any) {
    try {
        const result = yield call(userAPI.logIn, action.payload)
        console.log("success")
        console.log(result)
        yield put({
            type: LOG_IN_SUCCESS
        })
    } catch (e) {
        console.error(e)
        yield put({
            type: LOG_IN_FAILURE
        })
    }
}

function* watchLogIn() {
    yield takeLatest(LOG_IN_REQUEST, logIn)
}

function* register(action: any) {
    try {
        const result = yield call(userAPI.register, action.payload)
        console.log(result)
        yield put({
            type: REGISTER_SUCCESS
        })
    } catch (e) {
        console.error(e)
        yield put({
            type: REGISTER_FAILURE,
            payload: e
        })
    }
}

function* watchRegister() {
    yield takeLatest(REGISTER_REQUEST, register)
}

export default function* ownerSaga() {
    yield all([fork(watchLogIn), fork(watchRegister)])
}
