import React from 'react';
import cl from './.module.css';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';
import Panel from '../../components/Panel/Panel';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SignInLayout = () => {
    const { t, i18n } = useTranslation();

    const [submitting, setSubmitting] = React.useState(false);
    const [sendingEmail, setSendingEmail] = React.useState(false);

    const usernameInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);
    const resetPasswordInputRef = React.useRef(null);
    const dialogRef = React.useRef(null);

    const usernameInfoInputStyle = React.useMemo(() => {
        return { marginTop: '35px' };
    }, []);
    const passwordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '20px' };
    }, []);
    const submitButtonStyle = React.useMemo(() => {
        return { marginTop: '25px' };
    }, []);

    const signInRequest = React.useCallback(async () => {
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

    async function resetPasswordPermissionRequest() {
        setSendingEmail(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/reset-password-permission`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Language": i18n.language
            },
            body: JSON.stringify({
                username: resetPasswordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert(t('sign-in.reset-password-modal-window.email-is-sent'));
            dialogRef.current.close();
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

        setSendingEmail(false);
    }

    const windowKeyPressEvent = React.useCallback((e) => {
        switch (e.key) {
            case "Enter":
                signInRequest();
                break;
            default:
                return;
        }
    }, [signInRequest]);

    React.useEffect(() => {
        window.addEventListener("keypress", windowKeyPressEvent);

        return () => {
            window.removeEventListener("keypress", windowKeyPressEvent);
        };
    }, [windowKeyPressEvent]);

    return (
        <>
            <Panel
                title={t('sign-in.panel-header')}>
                <PanelInput
                    containerStyle={usernameInfoInputStyle}
                    label={t('sign-in.username-input')}
                    type='text'
                    placeholder={t('sign-in.username-input')}
                    maxLength='100'
                    ref={usernameInputRef} />
                <PanelInput
                    containerStyle={passwordInfoInputStyle}
                    label={t('sign-in.password-input')}
                    type='password'
                    placeholder={t('sign-in.password-input')}
                    maxLength='200'
                    ref={passwordInputRef} />
                <PanelButton
                    style={submitButtonStyle}
                    text={t('sign-in.submit')}
                    loading={submitting}
                    onClick={signInRequest} />
                <div className={cl.options}>
                    <Link className={cl.options_sign_up_link}
                        to='/sign-up'>
                        {t('sign-in.sign-up-link')}
                    </Link>
                    <span className={cl.options_forgot_password_link}
                        onClick={() => dialogRef.current.showModal()}>
                        {t('sign-in.forgot-password')}
                    </span>
                </div>
            </Panel>
            <dialog className={`${cl.modal_window}`}
                ref={dialogRef}>
                <div className={`${cl.modal_window__content}`}>
                    <h1 className={`${cl.modal_window__header}`}>
                        {t('sign-in.reset-password-modal-window.header')}
                    </h1>
                    <p className={`${cl.modal_window__reset_password__description}`}>
                        {t('sign-in.reset-password-modal-window.description')}
                    </p>
                    <input className={`${cl.modal_window__reset_password__input}`}
                        type="text"
                        placeholder={t('sign-in.reset-password-modal-window.username-input')}
                        maxLength="480"
                        ref={resetPasswordInputRef} />
                </div>
                <div className={`${cl.modal_window__control}`}>
                    <div className={`${cl.modal_window__control__buttons}`}>
                        <button className={`${cl.modal_window__control__buttons__cancel}`}
                            onClick={() => dialogRef.current.close()}>
                            {t('sign-in.reset-password-modal-window.cancel')}
                        </button>
                        <button className={`${cl.modal_window__control__buttons__apply}`}
                            onClick={() => {
                                if (!sendingEmail) {
                                    resetPasswordPermissionRequest();
                                }
                            }}>
                            {
                                sendingEmail ?
                                    <LoadingAnimation
                                        curveColor1="#FFFFFF"
                                        curveColor2="#00000000"
                                        size="15px"
                                        curveWidth="3px" />
                                    :
                                    <span>
                                        {t('sign-in.reset-password-modal-window.send-mail')}
                                    </span>
                            }
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default SignInLayout;
