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

const PasswordUserSettings = memo(() => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState(),
    );

    const { theme } = useTheme();

    const updateUserPasswordRequest = useCallback(async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (formData.get('confirmNewPassword') !== formData.get('newPassword')) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.ERROR, list: [t('components.password-user-settings.password-not-confirmed')] }
            });
            return;
        }

        formData.delete('confirmNewPassword')

        setLoading(true);

        const response = await fetch(`/api/users/password`, {
            method: "PUT",
            credentials: "include",
            body: formData,
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
                <CustomInput
                    containerStyle={formFieldStyle}
                    appearanceMode={CustomElementAppearanceModes.SETTINGS}
                    id='changePassword-currentPassword-input'
                    name='oldPassword'
                    type='password'
                    autoComplete='current-password'
                    placeholder={t('components.password-user-settings.old-password-input')}
                    maxLength='200'
                    required
                    valueMissingValidity={t('components.password-user-settings.old_password_invalid.value_missing')} />
                <CustomInput
                    containerStyle={formFieldStyle}
                    appearanceMode={CustomElementAppearanceModes.SETTINGS}
                    id='changePassword-newPassword-input'
                    name='newPassword'
                    type='password'
                    autoComplete='new-password'
                    placeholder={t('components.password-user-settings.new-password-input')}
                    pattern='^(?=.*\p{Nd})(?=.*\p{Lu})(?=.*\p{Ll}).+$'
                    minLength='6'
                    maxLength='200'
                    required
                    valueMissingValidity={t('components.password-user-settings.new_password_invalid.value_missing')}
                    tooShortValidity={t('components.password-user-settings.new_password_invalid.too_short')}
                    patternValidity={t('components.password-user-settings.new_password_invalid.pattern')} />
                <CustomInput
                    containerStyle={formFieldStyle}
                    appearanceMode={CustomElementAppearanceModes.SETTINGS}
                    id='changePassword-confirmNewPassword-input'
                    name='confirmNewPassword'
                    type='password'
                    autoComplete='off'
                    placeholder={t('components.password-user-settings.confirm-new-password-input')}
                    maxLength='200'
                    required
                    valueMissingValidity={t('components.password-user-settings.confirm_new_password_invalid.value_missing')} />
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
