import React from "react";
import cl from "./.module.css";
import { API_PORT, HOST } from "../../utils/constants";
import Panel from "../../components/Panel/Panel";
import PanelInput from "../../components/PanelInput/PanelInput";
import PanelButton from "../../components/PanelButton/PanelButton";
import { useTranslation } from "react-i18next";
import BlockMessage from "../../components/BlockMessage/BlockMessage";
import { useTheme } from '../../hooks/useTheme';
import MemoLink from "../../components/MemoLink/MemoLink";

const SignUpLayout = () => {
    const { t, i18n } = useTranslation();

    const [messageState, setMessageState] = React.useState('success');
    const [messages, setMessages] = React.useState([]);
    const [submitting, setSubmitting] = React.useState(false);

    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const { theme } = useTheme();

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

    const signUpRequest = React.useCallback(async (e) => {
        setMessages([]);
        setSubmitting(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/sign-up?locale=${i18n.language}`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: new FormData(e.target)
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
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                if (errors.length > 0) {
                    setMessageState('error')
                    setMessages(errors);
                }
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setMessageState('error');
            setMessages([t('general.server-error')]);
        }

        setSubmitting(false);
    }, [i18n.language, t]);

    return (
        <div className={`${cl.main} ${cl[theme]}`}>
            <Panel
                title={t('sign-up.panel-header')}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (submitting) return;
                    if (confirmPasswordInputRef.current.value !== passwordInputRef.current.value) {
                        setMessageState('error');
                        setMessages([t('sign-up.password-not-confirmed')]);
                        return;
                    }
                    signUpRequest(e);
                }}>
                <BlockMessage
                    style={blockMessageStyle}
                    state={messageState}
                    messages={messages} />
                <PanelInput
                    containerStyle={usernameInfoInputStyle}
                    name='username'
                    label={t('sign-up.username-input')}
                    type='text'
                    placeholder={t('sign-up.username-input')}
                    minLength='3'
                    maxLength='100'
                    required />
                <PanelInput
                    containerStyle={emailInfoInputStyle}
                    name='email'
                    label={t('sign-up.email-address-input')}
                    type='email'
                    placeholder={t('sign-up.email-address-input')}
                    maxLength='320'
                    required />
                <PanelInput
                    containerStyle={passwordInfoInputStyle}
                    name='password'
                    label={t('sign-up.password-input')}
                    type='password'
                    placeholder={t('sign-up.password-input')}
                    minLength='6'
                    maxLength='200'
                    required
                    ref={passwordInputRef} />
                <PanelInput
                    containerStyle={confirmPasswordInfoInputStyle}
                    label={t('sign-up.confirm-password-input')}
                    type='password'
                    placeholder={t('sign-up.confirm-password-input')}
                    maxLength='200'
                    required
                    ref={confirmPasswordInputRef} />
                <PanelButton
                    style={submitButtonStyle}
                    text={t('sign-up.create-account')}
                    loading={submitting} />
                <div className={cl.sign_in_link_cont}>
                    <MemoLink className={cl.sign_in_link} to='/sign-in'>
                        {t('sign-up.sign-in-link')}
                    </MemoLink>
                </div>
            </Panel>
        </div>
    );
}

export default SignUpLayout;
