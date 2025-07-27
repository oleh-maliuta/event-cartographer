import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, CLIENT_PORT, HOST } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';

const DeleteUserAccountSettings = React.memo(() => {
    const { t } = useTranslation();

    const [messages, setMessages] = React.useState({ state: 'success', list: [] });
    const [deletingAccount, setDeletingAccount] = React.useState(false);

    const { theme } = useTheme();

    async function deleteAccountRequest(e) {
        setDeletingAccount(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/delete`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
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

        setDeletingAccount(false);
    }

    const blockMessageStyle = React.useMemo(() => {
        return { marginTop: '8px', width: 'calc(100% - 6px)' };
    }, []);

    return (
        <form className={`${cl.element} ${cl[theme]}`}
            onSubmit={(e) => {
                e.preventDefault();
                if (deletingAccount) return;
                deleteAccountRequest(e);
            }}>
            <div className={`${cl.element__content}`}>
                <h3 className={`${cl.element__header}`}>
                    {t('settings.delete-account.header')}
                </h3>
                <p className={`${cl.element__description}`}>
                    {t('settings.delete-account.description')}
                </p>
                <input className={`${cl.element__input}`}
                    name='password'
                    type="password"
                    placeholder={t('settings.delete-account.password-input')}
                    maxLength="200"
                    required />
            </div>
            <BlockMessage
                style={blockMessageStyle}
                state={messages.state}
                messages={messages.list} />
            <div className={`${cl.element__control}`}>
                <button className={`${cl.element__control__delete_account}`}
                    type='submit'>
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
        </form>
    );
});

DeleteUserAccountSettings.displayName = 'DeleteUserAccountSettings';

export default DeleteUserAccountSettings;
