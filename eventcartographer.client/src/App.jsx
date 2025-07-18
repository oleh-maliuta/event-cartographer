import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUpLayout from "./layouts/SignUpLayout/SignUpLayout";
import SignInLayout from "./layouts/SignInLayout/SignInLayout";
import MainLayout from "./layouts/MainLayout/MainLayout";
import UserSettingsLayout from "./layouts/UserSettingsLayout/UserSettingsLayout";
import React from "react";
import { HOST, API_PORT, CLIENT_PORT } from "./constants";
import ResetPasswordLayout from "./layouts/ResetPasswordLayout/ResetPasswordLayout";
import { ThemeProvider } from "./providers/ThemeProvider";

const App = () => {
    async function authCheck() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/check`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });

        if (!response.ok) {
            if (
                window.location.pathname !== '/sign-in' &&
                window.location.pathname !== '/sign-up' &&
                window.location.pathname !== '/reset-password'
            ) {
                window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
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
                    <Route path="sign-up" element={<SignUpLayout />} />
                    <Route path="sign-in" element={<SignInLayout />} />
                    <Route path="reset-password" element={<ResetPasswordLayout />} />
                    <Route path="" element={<MainLayout />} />
                    <Route path="settings" element={<UserSettingsLayout />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
