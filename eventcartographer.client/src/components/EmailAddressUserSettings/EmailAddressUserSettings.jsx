import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, HOST } from '../../constants';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../providers/ThemeProvider';

const EmailAddressUserSettings = React.memo(() => {
    const { t, i18n } = useTranslation();

    const [messages, setMessages] = React.useState({ state: 'success', list: [] });
    const [updatingEmail, setUpdatingEmail] = React.useState(false);

    const passwordInputRef = React.useRef(null);
    const newEmailInputRef = React.useRef(null);

    const { theme } = useTheme();

    async function updateUserEmailRequest() {
        setUpdatingEmail(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/email`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Language": i18n.language
            },
            body: JSON.stringify({
                password: passwordInputRef.current.value || null,
                email: newEmailInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            setMessages({ state: 'success', list: [t('settings.email-address.email-is-sent')] });
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

        setUpdatingEmail(false);
    }

    const blockMessageStyle = React.useMemo(() => {
        return { marginTop: '8px', width: 'calc(100% - 6px)' };
    }, []);

    return (
        <div className={`${cl.element} ${cl[theme]}`}>
            <div className={`${cl.element__content}`}>
                <h3 className={`${cl.element__header}`}>
                    {t('settings.email-address.header')}
                </h3>
                <p className={`${cl.element__description}`}>
                    {t('settings.email-address.description')}
                </p>
                <input className={`${cl.element__input}`}
                    type="password"
                    placeholder={t('settings.email-address.password-input')}
                    maxLength="200"
                    ref={passwordInputRef} />
                <input className={`${cl.element__input}`}
                    type="email"
                    placeholder={t('settings.email-address.new-email-address-input')}
                    maxLength="320"
                    ref={newEmailInputRef} />
            </div>
            <BlockMessage
                style={blockMessageStyle}
                state={messages.state}
                messages={messages.list} />
            <div className={`${cl.element__control}`}>
                <button className={`${cl.element__control__apply}`}
                    onClick={() => {
                        if (!updatingEmail) {
                            updateUserEmailRequest();
                        }
                    }}>
                    {
                        updatingEmail ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="15px"
                                curveWidth="3px" />
                            :
                            <span>
                                {t('settings.email-address.apply')}
                            </span>
                    }
                </button>
            </div>
        </div>
    );
});

EmailAddressUserSettings.displayName = 'EmailAddressUserSettings';

export default EmailAddressUserSettings;
