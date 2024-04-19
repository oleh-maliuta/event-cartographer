import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import SignInPage from "./pages/SignInPage/SignInPage";
import MainPage from "./pages/MainPage/MainPage";
import UserSettingsPage from "./pages/UserSettingsPage/UserSettingsPage";
import React from "react";
import { HOST, API_PORT, CLIENT_PORT } from "./constants";

function App() {
    fetch(`${HOST}:${API_PORT}/api/users/check`, {
        method: "GET",
        mode: "cors",
        credentials: "include"
    })
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            if (
                !json.success &&
                window.location.pathname !== '/sign-in' &&
                window.location.pathname !== '/sign-up'
            ) {
                window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
            }
        })
        .catch(() => {
            window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
        });

    return (
        <BrowserRouter>
            <Routes>
                <Route path="sign-up" element={<SignUpPage />} />
                <Route path="sign-in" element={<SignInPage />} />
                <Route path="" element={<MainPage />} />
                <Route path="settings" element={<UserSettingsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;