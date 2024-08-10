import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, HOST } from '../../constants';
import { useTranslation } from 'react-i18next';

const EmailAddressUserSettings = React.memo(() => {
    const { t, i18n } = useTranslation();

    const [updatingEmail, setUpdatingEmail] = React.useState(false);

    const passwordInputRef = React.useRef(null);
    const newEmailInputRef = React.useRef(null);

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
            alert(t('settings.email-address.email-is-sent'));
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

        setUpdatingEmail(false);
    }

    return (
        <div className={cl.panel__other_settings__element}>
            <div className={`${cl.panel__other_settings__element__content}`}>
                <h3 className={`${cl.panel__other_settings__element__header}`}>
                    {t('settings.email-address.header')}
                </h3>
                <p className={`${cl.panel__other_settings__element__description}`}>
                    {t('settings.email-address.description')}
                </p>
                <input className={`${cl.panel__other_settings__element__input}`}
                    type="password"
                    placeholder={t('settings.email-address.password-input')}
                    maxLength="200"
                    ref={passwordInputRef} />
                <input className={`${cl.panel__other_settings__element__input}`}
                    type="email"
                    placeholder={t('settings.email-address.new-email-address-input')}
                    maxLength="320"
                    ref={newEmailInputRef} />
            </div>
            <div className={`${cl.panel__other_settings__element__control}`}>
                <button className={`${cl.panel__other_settings__element__control__apply}`}
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
