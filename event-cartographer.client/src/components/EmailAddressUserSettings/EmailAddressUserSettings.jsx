import { useState, memo, useReducer } from 'react';
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

    const [updatingEmail, setUpdatingEmail] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState(),
    );

    const { theme } = useTheme();

    async function updateUserEmailRequest(e) {
        setUpdatingEmail(true);

        const response = await fetch(`/api/users/email?locale=${i18n.language}`, {
            method: "PUT",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.SUCCESS, list: [t('settings.email-address.email-is-sent')] }
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

        setUpdatingEmail(false);
    }

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
                state={messageState} />
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
