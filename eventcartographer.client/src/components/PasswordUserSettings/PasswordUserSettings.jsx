import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, HOST } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';

const PasswordUserSettings = React.memo(() => {
    const { t } = useTranslation();

    const [messages, setMessages] = React.useState({ state: 'success', list: [] });
    const [updatingPassword, setUpdatingPassword] = React.useState(false);

    const oldPasswordInputRef = React.useRef(null);
    const newPasswordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const { theme } = useTheme();

    async function updateUserPasswordRequest() {
        setUpdatingPassword(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/password`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                oldPassword: oldPasswordInputRef.current.value || null,
                newPassword: newPasswordInputRef.current.value || null,
                confirmPassword: confirmPasswordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            setMessages({ state: 'success', list: [t('settings.password.password-is-changed')] });
        } else if (!response.ok) {
            if (json.message) {
                setMessages({ state: 'error', list: [t(json.message)] });
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                setMessages({ state: 'error', list: errors });
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setMessages({ state: 'error', list: [t('general.server-error')] });
        }

        setUpdatingPassword(false);
    }

    const blockMessageStyle = React.useMemo(() => {
        return { marginTop: '8px', width: 'calc(100% - 6px)' };
    }, []);

    return (
        <div className={`${cl.element} ${cl[theme]}`}>
            <div className={`${cl.element__content}`}>
                <h3 className={`${cl.element__header}`}>
                    {t('settings.password.header')}
                </h3>
                <input className={`${cl.element__input}`}
                    type="password"
                    placeholder={t('settings.password.old-password-input')}
                    maxLength="200"
                    ref={oldPasswordInputRef} />
                <input className={`${cl.element__input}`}
                    type="password"
                    placeholder={t('settings.password.new-password-input')}
                    maxLength="200"
                    ref={newPasswordInputRef} />
                <input className={`${cl.element__input}`}
                    type="password"
                    placeholder={t('settings.password.confirm-new-password-input')}
                    maxLength="200"
                    ref={confirmPasswordInputRef} />
            </div>
            <BlockMessage
                style={blockMessageStyle}
                state={messages.state}
                messages={messages.list} />
            <div className={`${cl.element__control}`}>
                <button className={`${cl.element__control__apply}`}
                    onClick={() => {
                        if (!updatingPassword) {
                            updateUserPasswordRequest();
                        }
                    }}>
                    {
                        updatingPassword ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="15px"
                                curveWidth="3px" />
                            :
                            <span>
                                {t('settings.password.apply')}
                            </span>
                    }
                </button>
            </div>
        </div>
    );
});

PasswordUserSettings.displayName = 'PasswordUserSettings';

export default PasswordUserSettings;
