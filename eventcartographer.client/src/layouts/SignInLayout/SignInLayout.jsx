import React from 'react';
import cl from './.module.css';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import Panel from '../../components/Panel/Panel';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResetPasswordDialog from '../../components/ResetPasswordDialog/ResetPasswordDialog';
import BlockMessage from '../../components/BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';

const SignInLayout = () => {
    const { t } = useTranslation();

    const [messages, setMessages] = React.useState([]);
    const [invalidationText, setInvalidationText] = React.useState({});
    const [submitting, setSubmitting] = React.useState(false);
    const [dialogOpened, setDialogOpened] = React.useState(false);

    const usernameInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const panelButtonRef = React.useRef(null);

    const { theme } = useTheme();

    function cleanAllMessages() {
        setInvalidationText({});
        setMessages([]);
    }

    const blockMessageStyle = React.useMemo(() => {
        return { marginTop: '15px', width: 'calc(100% - 6px)' };
    }, []);
    const usernameInfoInputStyle = React.useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const passwordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '20px' };
    }, []);
    const submitButtonStyle = React.useMemo(() => {
        return { marginTop: '35px' };
    }, []);

    const signInRequest = React.useCallback(async () => {
        cleanAllMessages();
        setSubmitting(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/sign-in`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: usernameInputRef.current.value || null,
                password: passwordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            window.location.href = `${HOST}:${CLIENT_PORT}`;
        } else if (!response.ok) {
            if (json.message) {
                setMessages([t(json.message)]);
            } else {
                const strKey = "http.request-errors.sign-in.";
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
                        } else if (json.errors[prop][err].startsWith(strKey + "password")) {
                            setInvalidationText(x => {
                                return {
                                    ...x,
                                    password: json.errors[prop][err].endsWith("required") ? "" : t(json.errors[prop][err])
                                };
                            });
                        }  else {
                            errors.push(t(json.errors[prop][err]));
                        }
                    }
                }

                if (errors.length > 0) {
                    setMessages(errors);
                }
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setMessages([t('general.server-error')]);
        }

        setSubmitting(false);
    }, [t]);

    const windowKeyPressEvent = React.useCallback((e) => {
        switch (e.key) {
            case "Enter":
                if (!dialogOpened) {
                    panelButtonRef.current.click();
                }
                break;
            default:
                return;
        }
    }, [dialogOpened]);

    React.useEffect(() => {
        window.addEventListener("keypress", windowKeyPressEvent);

        return () => {
            window.removeEventListener("keypress", windowKeyPressEvent);
        };
    }, [windowKeyPressEvent]);

    return (
        <div className={`${cl.main} ${cl[theme]}`}>
            <Panel
                title={t('sign-in.panel-header')}>
                <BlockMessage
                    style={blockMessageStyle}
                    state='error'
                    messages={messages} />
                <PanelInput
                    containerStyle={usernameInfoInputStyle}
                    label={t('sign-in.username-input')}
                    type='text'
                    placeholder={t('sign-in.username-input')}
                    maxLength='100'
                    invalidationText={invalidationText.username}
                    ref={usernameInputRef} />
                <PanelInput
                    containerStyle={passwordInfoInputStyle}
                    label={t('sign-in.password-input')}
                    type='password'
                    placeholder={t('sign-in.password-input')}
                    maxLength='200'
                    invalidationText={invalidationText.password}
                    ref={passwordInputRef} />
                <PanelButton
                    style={submitButtonStyle}
                    text={t('sign-in.submit')}
                    loading={submitting}
                    onClick={signInRequest}
                    ref={panelButtonRef} />
                <div className={cl.options}>
                    <Link className={cl.options_sign_up_link}
                        to='/sign-up'>
                        {t('sign-in.sign-up-link')}
                    </Link>
                    <span className={cl.options_forgot_password_link}
                        onClick={() => setDialogOpened(true)}>
                        {t('sign-in.forgot-password')}
                    </span>
                </div>
            </Panel>
            <ResetPasswordDialog
                dialogState={dialogOpened}
                setDialogState={setDialogOpened} />
        </div>
    );
}

export default SignInLayout;
