import React from "react";
import cl from "./.module.css";
import useRefDimensions from '../../hooks/useRefDimensions';
import { API_PORT, CLIENT_PORT, HOST } from "../../constants";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation";

export default function SignUpLayout() {
    const [signingUp, setSigningUp] = React.useState(false);

    const signUpPanelRef = React.useRef(null);
    const usernameInputRef = React.useRef(null);
    const emailInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const signUpPanelDimensions = useRefDimensions(signUpPanelRef);

    async function signUpRequest() {
        setSigningUp(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/sign-up`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: usernameInputRef.current.value || null,
                email: emailInputRef.current.value || null,
                password: passwordInputRef.current.value || null,
                confirmPassword: confirmPasswordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert("Email is sent to confirm your email address.");
            window.location.href = `${HOST}:${CLIENT_PORT}/sign-in`
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

        setSigningUp(false);
    }

    return (
        <div className={cl.main}>
            <div className={`${cl.panel} ${signUpPanelDimensions.height > window.innerHeight ? cl.fixed : ''}`} ref={signUpPanelRef}>
                <div className={cl.panel_header}>
                    <h1 className={cl.panel_header_text}>Sign up</h1>
                    <div className={cl.panel_header_line} />
                </div>
                <div className={cl.username}>
                    <p className={cl.username_header}>
                        Username
                    </p>
                    <input className={cl.username_input}
                        type='text'
                        placeholder='Username'
                        maxLength='100'
                        ref={usernameInputRef} />
                </div>
                <div className={cl.email}>
                    <p className={cl.email_header}>
                        Email address
                    </p>
                    <input className={cl.email_input}
                        type='email'
                        placeholder='Email address'
                        maxLength='320'
                        ref={emailInputRef} />
                </div>
                <div className={cl.password}>
                    <p className={cl.password_header}>
                        Password
                    </p>
                    <input className={cl.password_input}
                        type='password'
                        placeholder='Password'
                        maxLength='200'
                        ref={passwordInputRef} />
                </div>
                <div className={cl.confirm_password}>
                    <p className={cl.confirm_password_header}>
                        Confirm the password
                    </p>
                    <input className={cl.confirm_password_input}
                        type='password'
                        placeholder='Confirm the password'
                        maxLength='200'
                        ref={confirmPasswordInputRef} />
                </div>
                <button className={cl.create_account_button} onClick={() => {
                    if (!signingUp) {
                        signUpRequest();
                    }
                }}>
                    {
                        signingUp ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="20px"
                                curveWidth="3px" />
                            :
                            <span>Create account</span>
                    }
                </button>
                <div className={cl.sign_in_link_cont}>
                    <a className={cl.sign_in_link} href='/sign-in'>Sign in</a>
                </div>
            </div>
        </div>
    );
}