import React from "react";
import cl from "./.module.css";
import { API_PORT, CLIENT_PORT, HOST } from "../../constants";
import Panel from "../../components/Panel/Panel";
import PanelInput from "../../components/PanelInput/PanelInput";
import PanelButton from "../../components/PanelButton/PanelButton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SignUpLayout = () => {
    const { t } = useTranslation();

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
            alert(t('sign-up.email-is-sent'));
            window.location.href = `${HOST}:${CLIENT_PORT}/sign-in`
        } else if (!response.ok) {
            if (json.message) {
                alert(t(json.message));
            } else {
                let errors = "";
                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors += `${t(json.errors[prop][err])}\n`;
                    }
                }
                errors = errors.slice(0, -1);
                alert(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            alert(t('general.server-error'));
        }

        setSubmitting(false);
    }, [t]);

    const windowKeyPressEvent = React.useCallback((e) => {
        switch (e.key) {
            case "Enter":
                signUpRequest();
                break;
            default:
                return;
        }
    }, [signUpRequest]);

    React.useEffect(() => {
        window.addEventListener("keypress", windowKeyPressEvent);

        return () => {
            window.removeEventListener("keypress", windowKeyPressEvent);
        };
    }, [windowKeyPressEvent]);

    return (
        <Panel
            title={t('sign-up.panel-header')}>
            <PanelInput
                containerStyle={usernameInfoInputStyle}
                label={t('sign-up.username-input')}
                type='text'
                placeholder={t('sign-up.username-input')}
                maxLength='100'
                ref={usernameInputRef} />
            <PanelInput
                containerStyle={emailInfoInputStyle}
                label={t('sign-up.email-address-input')}
                type='email'
                placeholder={t('sign-up.email-address-input')}
                maxLength='320'
                ref={emailInputRef} />
            <PanelInput
                containerStyle={passwordInfoInputStyle}
                label={t('sign-up.password-input')}
                type='password'
                placeholder={t('sign-up.password-input')}
                maxLength='200'
                ref={passwordInputRef} />
            <PanelInput
                containerStyle={confirmPasswordInfoInputStyle}
                label={t('sign-up.confirm-password-input')}
                type='password'
                placeholder={t('sign-up.confirm-password-input')}
                maxLength='200'
                ref={confirmPasswordInputRef} />
            <PanelButton
                style={submitButtonStyle}
                text={t('sign-up.create-account')}
                loading={submitting}
                onClick={signUpRequest} />
            <div className={cl.sign_in_link_cont}>
                <Link className={cl.sign_in_link} to='/sign-in'>
                    {t('sign-up.sign-in-link')}
                </Link>
            </div>
        </Panel>
    );
}

export default SignUpLayout;
