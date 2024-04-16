import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import SignInPage from "./pages/SignInPage/SignInPage";
import MainPage from "./pages/MainPage/MainPage";
import UserSettingsPage from "./pages/UserSettingsPage/UserSettingsPage";

function App() {
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