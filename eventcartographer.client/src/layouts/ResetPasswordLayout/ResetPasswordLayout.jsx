import React from 'react';
import cl from './.module.css';
import useRefDimensions from '../../hooks/useRefDimensions';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import { useLocation } from 'react-router-dom';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';

export default function ResetPasswordLayout() {
    const searchParameters = new URLSearchParams(useLocation().search);

    const [resetting, setResetting] = React.useState(false);

    const resetPasswordPanelRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const resetPasswordPanelDimensions = useRefDimensions(resetPasswordPanelRef);

    async function resetPasswordRequest() {
        setResetting(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/reset-password`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: searchParameters.get('user') || null,
                token: searchParameters.get('token') || null,
                newPassword: passwordInputRef.current.value || null,
                confirmNewPassword: confirmPasswordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert("Password is reset.");
            window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
        } else if (!response.ok) {
            if (json.message) {
                alert(json.message);
            } else {
                let errors = "";
                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors += `${json.errors[prop][err]}\n`;
                    }
                }
                errors = errors.slice(0, -1);
                alert(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            alert("Server error.");
        }

        setResetting(true);
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
                <button className={cl.submit_button} onClick={() => {
                    if (!resetting) {
                        resetPasswordRequest();
                    }
                }}>
                    {
                        resetting ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="20px"
                                curveWidth="3px" />
                            :
                            <span>Submit</span>
                    }
                </button>
            </div>
        </div>
    );
}