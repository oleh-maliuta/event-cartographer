import { useState, memo, useReducer, useCallback } from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import { messageListReducer, messageListState } from '../../utils/reducers/messageListReducer';
import { CustomElementAppearanceModes, MessageStates } from '../../utils/constants';
import CustomInput from '../CustomInput/CustomInput';

const blockMessageStyle = { marginTop: '8px', width: 'calc(100% - 6px)' };
const formFieldStyle = { marginTop: '12px' };

const DeleteUserAccountSettings = memo(() => {
    const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState(),
    );

    const { theme } = useTheme();

    const deleteAccountRequest = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch(`/api/users/delete?locale=${i18n.language}`, {
            method: "PUT",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.SUCCESS, list: [t('components.delete-user-account-settings.success')] }
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
            onSubmit={deleteAccountRequest}>
            <div className={`${cl.element__content}`}>
                <h3 className={`${cl.element__header}`}>
                    {t('components.delete-user-account-settings.header')}
                </h3>
                <p className={`${cl.element__description}`}>
                    {t('components.delete-user-account-settings.description')}
                </p>
                <CustomInput
                    containerStyle={formFieldStyle}
                    appearanceMode={CustomElementAppearanceModes.SETTINGS}
                    id='deleteAccount-password-input'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    placeholder={t('components.delete-user-account-settings.password-input')}
                    maxLength='200'
                    required
                    valueMissingValidity={t('components.delete-user-account-settings.password_invalid.value_missing')} />
            </div>
            <BlockMessage
                style={blockMessageStyle}
                state={messageState} />
            <div className={`${cl.element__control}`}>
                <button className={`${cl.element__control__delete_account}`}
                    type='submit'
                    disabled={loading}>
                    {
                        loading ?
                            <LoadingAnimation
                                curveColor1="#FFFFFF"
                                curveColor2="#00000000"
                                size="15px"
                                curveWidth="3px" />
                            : t('components.delete-user-account-settings.delete')
                    }
                </button>
            </div>
        </form>
    );
});

DeleteUserAccountSettings.displayName = 'DeleteUserAccountSettings';

export default DeleteUserAccountSettings;
