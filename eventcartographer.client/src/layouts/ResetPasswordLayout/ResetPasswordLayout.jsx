import React from 'react';
import { API_PORT, HOST } from '../../constants';
import { useSearchParams } from 'react-router-dom';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import Panel from '../../components/Panel/Panel';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../../components/BlockMessage/BlockMessage';

const ResetPasswordLayout = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    const [messageState, setMessageState] = React.useState('success');
    const [messages, setMessages] = React.useState([]);
    const [invalidationText, setInvalidationText] = React.useState({});
    const [submitting, setSubmitting] = React.useState(false);
    const [isReset, setIsReset] = React.useState(false);

    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    function cleanAllMessages() {
        setInvalidationText({});
        setMessages([]);
    }

    const blockMessageStyle = React.useMemo(() => {
        return { marginTop: '15px', width: 'calc(100% - 6px)' };
    }, []);
    const passwordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const confirmPasswordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '20px' };
    }, []);
    const submitButtonStyle = React.useMemo(() => {
        return { marginTop: '35px' };
    }, []);

    const resetPasswordRequest = React.useCallback(async () => {
        if (isReset) {
            return;
        }

        cleanAllMessages();
        setSubmitting(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/reset-password`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: searchParams.get('user') || null,
                token: searchParams.get('token') || null,
                newPassword: passwordInputRef.current.value || null,
                confirmNewPassword: confirmPasswordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            setMessageState('success');
            setMessages([t('reset-password.password-is-reset')]);
            setIsReset(true);
        } else if (!response.ok) {
            setMessageState('error');
            if (json.message) {
                alert(t(json.message));
            } else {
                const strKey = "http.request-errors.reset-password.";
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        if (json.errors[prop][err].startsWith(strKey + "new-password")) {
                            setInvalidationText(x => {
                                return {
                                    ...x,
                                    password: json.errors[prop][err].endsWith("required") ? "" : t(json.errors[prop][err])
                                };
                            });
                        } else if (json.errors[prop][err].startsWith(strKey + "confirm-new-password")) {
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
    }, [isReset, searchParams, t]);

    const windowKeyPressEvent = React.useCallback((e) => {
        switch (e.key) {
            case "Enter":
                resetPasswordRequest();
                break;
            default:
                return;
        }
    }, [resetPasswordRequest]);

    React.useEffect(() => {
        window.addEventListener("keypress", windowKeyPressEvent);

        return () => {
            window.removeEventListener("keypress", windowKeyPressEvent);
        };
    }, [windowKeyPressEvent]);

    return (
        <Panel
            title={t('reset-password.panel-header')}>
            <BlockMessage
                style={blockMessageStyle}
                state={messageState}
                messages={messages} />
            <PanelInput
                containerStyle={passwordInfoInputStyle}
                label={t('reset-password.password-input')}
                type='password'
                placeholder={t('reset-password.password-input')}
                maxLength='200'
                invalidationText={invalidationText.password}
                ref={passwordInputRef} />
            <PanelInput
                containerStyle={confirmPasswordInfoInputStyle}
                label={t('reset-password.confirm-password-input')}
                type='password'
                placeholder={t('reset-password.confirm-password-input')}
                maxLength='200'
                invalidationText={invalidationText.confirmPassword}
                ref={confirmPasswordInputRef} />
            <PanelButton
                style={submitButtonStyle}
                text={t('reset-password.submit')}
                loading={submitting}
                onClick={resetPasswordRequest} />
        </Panel>
    );
}

export default ResetPasswordLayout;
