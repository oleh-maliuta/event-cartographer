import React from 'react';
import cl from './.module.css';
import useRefDimensions from '../../hooks/useRefDimensions';

export default function SignInPage() {
    const [rememberMeCheckboxValue, setRememberMeCheckboxValue] = React.useState(false);

    const signInPanelRef = React.useRef(null);

    const signInPanelDimensions = useRefDimensions(signInPanelRef);

    return (
        <div className={cl.main}>
            <form className={`${cl.panel} ${signInPanelDimensions.height > window.innerHeight ? cl.fixed : ''}`} ref={signInPanelRef}>
                <div className={cl.panel_header}>
                    <h1 className={cl.panel_header_text}>Sign in</h1>
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
                <div className={cl.remember_me}>
                    <div
                        className={`${cl.remember_me_checkbox} ${rememberMeCheckboxValue ? cl.checked : ''}`}
                        onClick={() => setRememberMeCheckboxValue(p => !p)}>
                        <img className={cl.remember_me_checkbox_img} alt='check' />
                    </div>
                    <div className={cl.remember_me_label}>
                        <span className={cl.remember_me_text}>Remember me</span>
                    </div>
                </div>
                <button className={cl.submit_button} type='submit'>Submit</button>
                <div className={cl.options}>
                    <div className={cl.options_sign_up}>
                        <a className={cl.options_sign_up_link} href='/sign-up'>Sign up</a>
                    </div>
                    <div className={cl.options_forgot_password}>
                        <a className={cl.options_forgot_password_link}>Forgot password?</a>
                    </div>
                </div>
            </form>
        </div>
    );
}
