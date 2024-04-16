import React from "react";
import cl from "./.module.css";
import useRefDimensions from '../../hooks/useRefDimensions';

export default function SignUpPage() {
    const signUpPanelRef = React.useRef(null);

    const signUpPanelDimensions = useRefDimensions(signUpPanelRef);

    return (
        <div className={cl.main}>
            <form className={`${cl.panel} ${signUpPanelDimensions.height > window.innerHeight ? cl.fixed : ''}`} ref={signUpPanelRef}>
                <div className={cl.panel_header}>
                    <h1 className={cl.panel_header_text}>Sign up</h1>
                    <div className={cl.panel_header_line} />
                </div>
                <div className={cl.username}>
                    <p className={cl.username_header}>
                        Username
                    </p>
                    <input className={cl.username_input} type='text' placeholder='Username' />
                </div>
                <div className={cl.password}>
                    <p className={cl.password_header}>
                        Password
                    </p>
                    <input className={cl.password_input} type='password' placeholder='Password' />
                </div>
                <div className={cl.confirm_password}>
                    <p className={cl.confirm_password_header}>
                        Confirm the password
                    </p>
                    <input className={cl.confirm_password_input} type='password' placeholder='Confirm the password' />
                </div>
                <button className={cl.create_account_button} type='submit'>Create account</button>
                <div className={cl.sign_in_link_cont}>
                    <a className={cl.sign_in_link} href='/sign-in'>Sign in</a>
                </div>
            </form>
        </div>
    );
}