import { useState, memo, useReducer, useCallback } from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import { messageListReducer, messageListState } from '../../utils/reducers/messageListReducer';
import { MessageStates } from '../../utils/constants';

const blockMessageStyle = { marginTop: '8px', width: 'calc(100% - 6px)' };

const EmailAddressUserSettings = memo(() => {
    const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState(),
    );

    const { theme } = useTheme();

    const updateUserEmailRequest = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch(`/api/users/email?locale=${i18n.language}`, {
            method: "PUT",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.SUCCESS, list: [t('components.email-address-user-settings.success')] }
            });
        } else if (!response.ok) {
            if (json.message) {
                dispatchMessageState({
                    type: 'SET_MESSAGES',
                    payload: { mode: MessageStates.ERROR, list: [t(json.message)] }
                });
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                dispatchMessageState({
                    type: 'SET_MESSAGES',
                    payload: { mode: MessageStates.ERROR, list: errors }
                });
            }
        } else if (response.status >= 500 && response.status <= 599) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.ERROR, list: [t('general.server-error')] }
            });
        }

        setLoading(false);
    }, [i18n.language, t]);

    return (
        <form className={`${cl.element} ${cl[theme]}`}
            onSubmit={updateUserEmailRequest}>
            <div className={`${cl.element__content}`}>
                <h3 className={`${cl.element__header}`}>
                    {t('components.email-address-user-settings.header')}
                </h3>
                <p className={`${cl.element__description}`}>
                    {t('components.email-address-user-settings.description')}
                </p>
                <input className={`${cl.element__input}`}
                    name='password'
                    type="password"
                    placeholder={t('components.email-address-user-settings.password-input')}
                    maxLength="200"
                    required />
                <input className={`${cl.element__input}`}
                    name='email'
                    type="email"
                    placeholder={t('components.email-address-user-settings.new-email-address-input')}
                    maxLength="320"
                    required />
            </div>
            <BlockMessage
                style={blockMessageStyle}
                state={messageState} />
            <div className={`${cl.element__control}`}>
                <button className={`${cl.element__control__apply}`}
                    disabled={loading}
                    type='submit'>
                    {
                        loading ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="15px"
                                curveWidth="3px" />
                            :
                            <span>
                                {t('components.email-address-user-settings.apply')}
                            </span>
                    }
                </button>
            </div>
        </form>
    );
});

EmailAddressUserSettings.displayName = 'EmailAddressUserSettings';

export default EmailAddressUserSettings;
