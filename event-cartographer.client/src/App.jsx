import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { PageRoutes } from "./utils/constants";
import SignUpLayout from "./layouts/SignUpLayout/SignUpLayout";
import SignInLayout from "./layouts/SignInLayout/SignInLayout";
import HomeLayout from "./layouts/HomeLayout/HomeLayout";
import UserSettingsLayout from "./layouts/UserSettingsLayout/UserSettingsLayout";
import ResetPasswordLayout from "./layouts/ResetPasswordLayout/ResetPasswordLayout";

async function authCheck(navHook, path) {
    const response = await fetch('/api/users/check', {
        method: "GET",
        credentials: "include"
    });

    const allowedRoutes = [
        PageRoutes.SIGN_IN,
        PageRoutes.SIGN_UP,
        PageRoutes.RESET_PASSWORD
    ];

    if (!response.ok && !allowedRoutes.includes(path))
        navHook(PageRoutes.SIGN_IN, { replace: true });
}

const App = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        authCheck(navigate, location.pathname);
    }, [location.pathname, navigate]);

    return (
        <Routes>
            <Route path={PageRoutes.SIGN_UP} element={<SignUpLayout />} />
            <Route path={PageRoutes.SIGN_IN} element={<SignInLayout />} />
            <Route path={PageRoutes.RESET_PASSWORD} element={<ResetPasswordLayout />} />
            <Route path={PageRoutes.HOME} element={<HomeLayout />} />
            <Route path={PageRoutes.USER_SETTINGS} element={<UserSettingsLayout />} />
        </Routes>
    );
}

export default App;
