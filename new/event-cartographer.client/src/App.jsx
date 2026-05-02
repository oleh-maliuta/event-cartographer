import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUpLayout from "./layouts/SignUpLayout/SignUpLayout";
import SignInLayout from "./layouts/SignInLayout/SignInLayout";
import HomeLayout from "./layouts/HomeLayout/HomeLayout";
import UserSettingsLayout from "./layouts/UserSettingsLayout/UserSettingsLayout";
import React from "react";
import ResetPasswordLayout from "./layouts/ResetPasswordLayout/ResetPasswordLayout";
import { ThemeProvider } from "./providers/ThemeProvider";
import { PageRoutes } from "./utils/constants";

const App = () => {
    async function authCheck() {
        const response = await fetch('/api/users/check', {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });

        if (!response.ok) {
            if (
                window.location.pathname !== PageRoutes.SIGN_IN &&
                window.location.pathname !== PageRoutes.SIGN_UP &&
                window.location.pathname !== PageRoutes.RESET_PASSWORD
            ) {
                window.location.replace(PageRoutes.SIGN_IN);
            }
        }
    }

    React.useEffect(() => {
        authCheck();
    }, []);

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path={PageRoutes.SIGN_UP} element={<SignUpLayout />} />
                    <Route path={PageRoutes.SIGN_IN} element={<SignInLayout />} />
                    <Route path={PageRoutes.RESET_PASSWORD} element={<ResetPasswordLayout />} />
                    <Route path={PageRoutes.HOME} element={<HomeLayout />} />
                    <Route path={PageRoutes.USER_SETTINGS} element={<UserSettingsLayout />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
