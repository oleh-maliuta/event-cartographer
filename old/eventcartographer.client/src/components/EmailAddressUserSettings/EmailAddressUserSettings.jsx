import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, HOST } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';

const EmailAddressUserSettings = React.memo(() => {
    const { t, i18n } = useTranslation();

    const [messages, setMessages] = React.useState({ state: 'success', list: [] });
    const [updatingEmail, setUpdatingEmail] = React.useState(false);

    const { theme } = useTheme();

    async function updateUserEmailRequest(e) {
        setUpdatingEmail(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/email?locale=${i18n.language}`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            body: new FormData(e.target)
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
        <form className={`${cl.element} ${cl[theme]}`}
            onSubmit={(e) => {
                e.preventDefault();
                if (updatingEmail) return;
                updateUserEmailRequest(e);
            }}>
            <div className={`${cl.element__content}`}>
                <h3 className={`${cl.element__header}`}>
                    {t('settings.email-address.header')}
                </h3>
                <p className={`${cl.element__description}`}>
                    {t('settings.email-address.description')}
                </p>
                <input className={`${cl.element__input}`}
                    name='password'
                    type="password"
                    placeholder={t('settings.email-address.password-input')}
                    maxLength="200"
                    required />
                <input className={`${cl.element__input}`}
                    name='email'
                    type="email"
                    placeholder={t('settings.email-address.new-email-address-input')}
                    maxLength="320"
                    required />
            </div>
            <BlockMessage
                style={blockMessageStyle}
                state={messages.state}
                messages={messages.list} />
            <div className={`${cl.element__control}`}>
                <button className={`${cl.element__control__apply}`}
                    type='submit'>
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
        </form>
    );
});

EmailAddressUserSettings.displayName = 'EmailAddressUserSettings';

export default EmailAddressUserSettings;
