import React from 'react';
import cl from './.module.css';
import useRefDimensions from '../../hooks/useRefDimensions';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';

export default function SignInLayout() {
    const [signingIn, setSigningIn] = React.useState(false);
    const [isModalWindowVisible, setModalWindowVisibility] = React.useState(false);

    const signInPanelRef = React.useRef(null);
    const usernameInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const resetPasswordInputRef = React.useRef(null);

    const signInPanelDimensions = useRefDimensions(signInPanelRef);

    async function signInRequest() {
        setSigningIn(true);

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

        setSigningIn(false);
    }

    async function resetPasswordPermissionRequest() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/reset-password-permission`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(resetPasswordInputRef.current.value)
        });
        const json = await response.json();

        if (response.status === 200) {
            alert("Email is sent.");
            setModalWindowVisibility(false);
        } else if (response.status === 500) {
            alert("Server error.");
        } else if (response.status < 500 && response.status >= 400 && json.message) {
            alert(json.message);
        } else {
            alert("Input format error.");
        }
    }

    function renderModalWindow() {
        return (
            <div className={`${cl.modal_window__background}`}
                onClick={() => { setModalWindowVisibility(false); }}>
                <div className={`${cl.modal_window}`}
                    onClick={(e) => { e.stopPropagation(); }}>
                    <div className={`${cl.modal_window__content}`}>
                        <h1 className={`${cl.modal_window__header}`}>Reset password</h1>
                        <p className={`${cl.modal_window__reset_password__description}`}>
                            Input username of your account to send an email
                            to give you a permission to reset the password.
                        </p>
                        <div className={`${cl.modal_window__reset_password__cont}`}>
                            <label className={`${cl.modal_window__reset_password__label}`}>Username</label>
                            <input className={`${cl.modal_window__reset_password__input}`}
                                type="text"
                                placeholder="..."
                                maxLength="480"
                                ref={resetPasswordInputRef} />
                        </div>
                    </div>
                    <div className={`${cl.modal_window__control}`}>
                        <div className={`${cl.modal_window__control__buttons}`}>
                            <button className={`${cl.modal_window__control__buttons__cancel}`}
                                onClick={() => { setModalWindowVisibility(false); }}>
                                Cancel
                            </button>
                            <button className={`${cl.modal_window__control__buttons__apply}`}
                                onClick={resetPasswordPermissionRequest}>
                                Send mail
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                <button className={cl.submit_button} onClick={() => {
                    if (!signingIn) {
                        signInRequest();
                    }
                }}>
                {
                        signingIn ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="20px"
                                curveWidth="3px" />
                            :
                            <span>Submit</span>
                    }
                </button>
                <div className={cl.options}>
                    <div className={cl.options_sign_up}>
                        <a className={cl.options_sign_up_link} href='/sign-up'>Sign up</a>
                    </div>
                    <div className={cl.options_forgot_password}>
                        <a className={cl.options_forgot_password_link}
                            onClick={() => setModalWindowVisibility(true)}>
                            Forgot password?
                        </a>
                    </div>
                </div>
            </div>
            {isModalWindowVisible ? renderModalWindow() : <></>}
        </div>
    );
}
