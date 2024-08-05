import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import { useTranslation } from 'react-i18next';

const DeleteUserAccountSettings = React.memo(() => {
    const { t } = useTranslation();

    const [deletingAccount, setDeletingAccount] = React.useState(false);

    const confirmAccountDeletionInputRef = React.useRef(null);

    async function deleteAccountRequest() {
        setDeletingAccount(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/delete`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: confirmAccountDeletionInputRef.current.value || null,
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert(t('settings.delete-account.account-is-deleted'));
            window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
        } else if (!response.ok) {
            if (json.message) {
                alert(json.message);
            } else {
                let errors = "";
                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors += `${json.errors[prop][err]}\n`;
                    }
                }
                errors = errors.slice(0, -1);
                alert(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            alert(t('general.server-error'));
        }

        setDeletingAccount(false);
    }

    return (
        <div className={cl.panel__other_settings__element}>
            <div className={`${cl.panel__other_settings__element__content}`}>
                <h3 className={`${cl.panel__other_settings__element__header}`}>
                    {t('settings.delete-account.header')}
                </h3>
                <p className={`${cl.panel__other_settings__element__description}`}>
                    {t('settings.delete-account.description')}
                </p>
                <input className={`${cl.panel__other_settings__element__input}`}
                    type="password"
                    placeholder={t('settings.delete-account.password-input')}
                    maxLength="200"
                    ref={confirmAccountDeletionInputRef} />
            </div>
            <div className={`${cl.panel__other_settings__element__control}`}>
                <button className={`${cl.panel__other_settings__element__control__delete_account}`}
                    onClick={() => {
                        if (!deletingAccount) {
                            deleteAccountRequest();
                        }
                    }}>
                    {
                        deletingAccount ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="15px"
                                curveWidth="3px" />
                            :
                            <span>
                                {t('settings.delete-account.delete')}
                            </span>
                    }
                </button>
            </div>
        </div>
    );
});

DeleteUserAccountSettings.displayName = 'DeleteUserAccountSettings';

export default DeleteUserAccountSettings;
