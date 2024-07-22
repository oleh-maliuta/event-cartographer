import React from 'react';
import cl from './.module.css';
import useRefDimensions from '../../hooks/useRefDimensions';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import { useLocation } from 'react-router-dom';

export default function ResetPasswordLayout() {
    const searchParameters = new URLSearchParams(useLocation().search);

    const resetPasswordPanelRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const resetPasswordPanelDimensions = useRefDimensions(resetPasswordPanelRef);

    async function resetPasswordRequest() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/reset-password`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: searchParameters.get('id'),
                token: searchParameters.get('token'),
                newPassword: passwordInputRef.current.value,
                confirmNewPassword: confirmPasswordInputRef.current.value
            })
        });
        const json = await response.json();

        if (response.status === 200) {
            alert("Password is reset.");
            window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
        } else if (response.status === 500) {
            alert("Server error.");
        } else if (response.status < 500 && response.status >= 400 && json.message) {
            alert(json.message);
        } else {
            alert("Input format error.");
        }
    }

    return (
        <div className={cl.main}>
            <div className={`${cl.panel} ${resetPasswordPanelDimensions.height > window.innerHeight ? cl.fixed : ''}`} ref={resetPasswordPanelRef}>
            <div className={cl.panel_header}>
                    <h1 className={cl.panel_header_text}>Reset password</h1>
                    <div className={cl.panel_header_line} />
                </div>
                <div className={cl.password}>
                    <p className={cl.password_header}>
                        Password
                    </p>
                    <input className={cl.password_input} type='password' placeholder='Password' ref={passwordInputRef} />
                </div>
                <div className={cl.confirm_password}>
                    <p className={cl.confirm_password_header}>
                        Confirm password
                    </p>
                    <input className={cl.confirm_password_input} type='password' placeholder='Confirm password' ref={confirmPasswordInputRef} />
                </div>
                <button className={cl.submit_button} onClick={resetPasswordRequest}>Submit</button>
            </div>
        </div>
    );
}