import React from "react";
import cl from "./.module.css";
import { API_PORT, HOST } from "../../constants";
import Panel from "../../components/Panel/Panel";
import PanelInput from "../../components/PanelInput/PanelInput";
import PanelButton from "../../components/PanelButton/PanelButton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BlockMessage from "../../components/BlockMessage/BlockMessage";
import { useTheme } from '../../hooks/useTheme';

const SignUpLayout = () => {
    const { t, i18n } = useTranslation();

    const [messageState, setMessageState] = React.useState('success');
    const [messages, setMessages] = React.useState([]);
    const [invalidationText, setInvalidationText] = React.useState({});
    const [submitting, setSubmitting] = React.useState(false);

    const usernameInputRef = React.useRef(null);
    const emailInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const { theme } = useTheme();

    function cleanAllMessages() {
        setInvalidationText({});
        setMessages([]);
    }

    const blockMessageStyle = React.useMemo(() => {
        return { marginTop: '20px', width: 'calc(100% - 6px)' };
    }, []);
    const usernameInfoInputStyle = React.useMemo(() => {
        return { marginTop: '15px' };
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
        cleanAllMessages();
        setSubmitting(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/sign-up`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Language": i18n.language
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
            setMessageState('success');
            setMessages([t('sign-up.email-is-sent')]);
        } else if (!response.ok) {
            if (json.message) {
                setMessageState('error');
                setMessages([t(json.message)]);
            } else {
                const strKey = "http.request-errors.sign-up.";
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        if (json.errors[prop][err].startsWith(strKey + "username")) {
                            setInvalidationText(x => {
                                return {
                                    ...x,
                                    username: json.errors[prop][err].endsWith("required") ? "" : t(json.errors[prop][err])
                                };
                            });
                        } else if (json.errors[prop][err].startsWith(strKey + "email")) {
                            setInvalidationText(x => {
                                return {
                                    ...x,
                                    email: json.errors[prop][err].endsWith("required") ? "" : t(json.errors[prop][err])
                                };
                            });
                        } else if (json.errors[prop][err].startsWith(strKey + "password")) {
                            setInvalidationText(x => {
                                return {
                                    ...x,
                                    password: json.errors[prop][err].endsWith("required") ? "" : t(json.errors[prop][err])
                                };
                            });
                        } else if (json.errors[prop][err].startsWith(strKey + "confirm-password")) {
                            setInvalidationText(x => {
                                return {
                                    ...x,
                                    confirmPassword: json.errors[prop][err].endsWith("required") ? "" : t(json.errors[prop][err])
                                };
                            });
                        } else {
                            errors.push(t(json.errors[prop][err]));
                        }
                    }
                }

                if (errors.length > 0) {
                    setMessages(errors);
                }
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setMessageState('error');
            setMessages([t('general.server-error')]);
        }

        setSubmitting(false);
    }, [t, i18n]);

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
        <div className={`${cl.main} ${cl[theme]}`}>
            <Panel
                title={t('sign-up.panel-header')}>
                <BlockMessage
                    style={blockMessageStyle}
                    state={messageState}
                    messages={messages} />
                <PanelInput
                    containerStyle={usernameInfoInputStyle}
                    label={t('sign-up.username-input')}
                    type='text'
                    placeholder={t('sign-up.username-input')}
                    maxLength='100'
                    invalidationText={invalidationText.username}
                    ref={usernameInputRef} />
                <PanelInput
                    containerStyle={emailInfoInputStyle}
                    label={t('sign-up.email-address-input')}
                    type='email'
                    placeholder={t('sign-up.email-address-input')}
                    maxLength='320'
                    invalidationText={invalidationText.email}
                    ref={emailInputRef} />
                <PanelInput
                    containerStyle={passwordInfoInputStyle}
                    label={t('sign-up.password-input')}
                    type='password'
                    placeholder={t('sign-up.password-input')}
                    maxLength='200'
                    invalidationText={invalidationText.password}
                    ref={passwordInputRef} />
                <PanelInput
                    containerStyle={confirmPasswordInfoInputStyle}
                    label={t('sign-up.confirm-password-input')}
                    type='password'
                    placeholder={t('sign-up.confirm-password-input')}
                    maxLength='200'
                    invalidationText={invalidationText.confirmPassword}
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
        </div>
    );
}

export default SignUpLayout;
