import React from "react";
import cl from "./.module.css";
import { API_PORT, CLIENT_PORT, HOST } from "../../constants";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation";
import Panel from "../../components/Panel/Panel";
import PanelInput from "../../components/PanelInput/PanelInput";
import PanelButton from "../../components/PanelButton/PanelButton";
import { Link } from "react-router-dom";

const SignUpLayout = () => {
    const [submitting, setSubmitting] = React.useState(false);

    const usernameInputRef = React.useRef(null);
    const emailInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const usernameInfoInputStyle = React.useMemo(() => {
        return { marginTop: '35px' };
    }, []);
    const emailInfoInputStyle = React.useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const passwordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const confirmPasswordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const submitButtonStyle = React.useMemo(() => {
        return { marginTop: '30px' };
    }, []);

    const signUpRequest = React.useCallback(async () => {
        setSubmitting(true);

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

        setSubmitting(false);
    });

    return (
        <Panel
            title='Sign up'>
            <PanelInput
                containerStyle={usernameInfoInputStyle}
                label='Username'
                type='text'
                placeholder='Username'
                maxLength='100'
                ref={usernameInputRef} />
            <PanelInput
                containerStyle={emailInfoInputStyle}
                label='Email address'
                type='email'
                placeholder='Email address'
                maxLength='320'
                ref={emailInputRef} />
            <PanelInput
                containerStyle={passwordInfoInputStyle}
                label='Password'
                type='password'
                placeholder='Password'
                maxLength='200'
                ref={passwordInputRef} />
            <PanelInput
                containerStyle={confirmPasswordInfoInputStyle}
                label='Confirm password'
                type='password'
                placeholder='Confirm password'
                maxLength='200'
                ref={confirmPasswordInputRef} />
            <PanelButton
                style={submitButtonStyle}
                text='Create account'
                loading={submitting}
                onClick={signUpRequest} />
            <div className={cl.sign_in_link_cont}>
                <Link className={cl.sign_in_link} to='/sign-in'>Sign in</Link>
            </div>
        </Panel>
    );
}

export default SignUpLayout;
