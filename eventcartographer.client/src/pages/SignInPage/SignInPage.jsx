import React from 'react';
import cl from './.module.css';
import useRefDimensions from '../../hooks/useRefDimensions';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';

export default function SignInPage() {
    const signInPanelRef = React.useRef(null);
    const usernameInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);

    const signInPanelDimensions = useRefDimensions(signInPanelRef);

    async function signInRequest() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/sign-in`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: usernameInputRef.current.value,
                password: passwordInputRef.current.value
            })
        });
        const json = await response.json();

        if (response.ok) {
            window.location.href = `${HOST}:${CLIENT_PORT}`;
        } else if (!response.ok) {
            if (json.message) {
                alert(json.message);
            } else {
                alert("Invalid input.");
            }
        } else if (response.status === 500) {
            alert("Server error.");
        }
    }

    return (
        <div className={cl.main}>
            <div className={`${cl.panel} ${signInPanelDimensions.height > window.innerHeight ? cl.fixed : ''}`} ref={signInPanelRef}>
                <div className={cl.panel_header}>
                    <h1 className={cl.panel_header_text}>Sign in</h1>
                    <div className={cl.panel_header_line} />
                </div>
                <div className={cl.username}>
                    <p className={cl.username_header}>
                        Username
                    </p>
                    <input className={cl.username_input} type='text' placeholder='Username' ref={usernameInputRef} />
                </div>
                <div className={cl.password}>
                    <p className={cl.password_header}>
                        Password
                    </p>
                    <input className={cl.password_input} type='password' placeholder='Password' ref={passwordInputRef} />
                </div>
                <button className={cl.submit_button} onClick={signInRequest}>Submit</button>
                <div className={cl.options}>
                    <div className={cl.options_sign_up}>
                        <a className={cl.options_sign_up_link} href='/sign-up'>Sign up</a>
                    </div>
                    <div className={cl.options_forgot_password}>
                        <a className={cl.options_forgot_password_link}>Forgot password?</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
