import { useSelector, useDispatch } from "react-redux"
import { RootState } from "src/store/reducers"
import { useCallback } from "react"
import { LOG_IN_REQUEST } from "src/store/actions/owner"

interface LogInPayload {
    id: string
    password: string
}

export default function useLoginRequest() {
    const { isLoggingIn, loginErrorMessage } = useSelector(
        (state: RootState) => state.owner
    )
    const dispatch = useDispatch()

    const logIn = useCallback(
        (payload: LogInPayload) => dispatch({ type: LOG_IN_REQUEST, payload }),
        [dispatch]
    )

    return {
        isLoggingIn,
        loginErrorMessage,
        logIn
    }
}
