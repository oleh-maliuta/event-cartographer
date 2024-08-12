import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, HOST } from '../../constants';
import { useTranslation } from 'react-i18next';

const PasswordUserSettings = React.memo(() => {
    const { t } = useTranslation();

    const [theme] = React.useState(localStorage.getItem('theme') ??
        window.matchMedia("(prefers-color-scheme: light)").matches ? 'light' : 'dark');
    const [updatingPassword, setUpdatingPassword] = React.useState(false);

    const oldPasswordInputRef = React.useRef(null);
    const newPasswordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

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
            alert(t('settings.password.password-is-changed'));
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

        setUpdatingPassword(false);
    }

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
