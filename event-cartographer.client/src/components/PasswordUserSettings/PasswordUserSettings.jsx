import { useState, useRef, memo, useReducer, useCallback } from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import { messageListReducer, messageListState } from '../../utils/reducers/messageListReducer';
import { MessageStates } from '../../utils/constants';

const blockMessageStyle = { marginTop: '8px', width: 'calc(100% - 6px)' };

const PasswordUserSettings = memo(() => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState(),
    );

    const newPasswordInputRef = useRef(null);
    const confirmPasswordInputRef = useRef(null);

    const { theme } = useTheme();

    const updateUserPasswordRequest = useCallback(async (e) => {
        if (confirmPasswordInputRef.current.value !== newPasswordInputRef.current.value) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.ERROR, list: [t('components.password-user-settings.password-not-confirmed')] }
            });
            return;
        }

        setLoading(true);

        const response = await fetch(`/api/users/password`, {
            method: "PUT",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.SUCCESS, list: [t('components.password-user-settings.password-is-changed')] }
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
    }, [t]);

    return (
        <form className={`${cl.element} ${cl[theme]}`}
            onSubmit={updateUserPasswordRequest}>
            <div className={`${cl.element__content}`}>
                <h3 className={`${cl.element__header}`}>
                    {t('components.password-user-settings.header')}
                </h3>
                <input className={`${cl.element__input}`}
                    name='oldPassword'
                    type="password"
                    placeholder={t('components.password-user-settings.old-password-input')}
                    maxLength="200"
                    required />
                <input className={`${cl.element__input}`}
                    name='newPassword'
                    type="password"
                    placeholder={t('components.password-user-settings.new-password-input')}
                    minLength='6'
                    maxLength="200"
                    required
                    ref={newPasswordInputRef} />
                <input className={`${cl.element__input}`}
                    type="password"
                    placeholder={t('components.password-user-settings.confirm-new-password-input')}
                    maxLength="200"
                    required
                    ref={confirmPasswordInputRef} />
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
                                {t('components.password-user-settings.apply')}
                            </span>
                    }
                </button>
            </div>
        </form>
    );
});

PasswordUserSettings.displayName = 'PasswordUserSettings';

export default PasswordUserSettings;
