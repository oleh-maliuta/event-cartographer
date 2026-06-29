import { useState, useCallback, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomInput from '../../components/CustomInput/CustomInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import Panel from '../../components/Panel/Panel';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../../components/BlockMessage/BlockMessage';
import { messageListReducer, messageListState } from '../../utils/reducers/messageListReducer';
import { CustomElementAppearanceModes, MessageStates } from '../../utils/constants';

const blockMessageStyle = { marginTop: '15px', width: 'calc(100% - 6px)' };
const passwordInfoInputStyle = { marginTop: '15px' };
const confirmPasswordInfoInputStyle = { marginTop: '20px' };
const submitButtonStyle = { marginTop: '35px' };

const ResetPasswordLayout = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    const [submitting, setSubmitting] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState()
    );

    const resetPasswordRequest = useCallback(async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        if (formData.get('newPassword') !== formData.get('confirmPassword')) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.ERROR, list: [t('layouts.reset-password.password-not-confirmed')] }
            });
            return;
        } else {
            formData.delete('confirmPassword');
            dispatchMessageState({ type: 'CLEAR_MESSAGES' });
        }

        setSubmitting(true);

        formData.append('username', searchParams.get('user') || null);
        formData.append('token', searchParams.get('token') || null);

        const response = await fetch('/api/users/reset-password', {
            method: "PUT",
            credentials: "include",
            body: formData
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.SUCCESS, list: [t('layouts.reset-password.password-is-reset')] }
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

                if (errors.length > 0) {
                    dispatchMessageState({
                        type: 'SET_MESSAGES',
                        payload: { mode: MessageStates.ERROR, list: errors }
                    });
                }
            }
        } else if (response.status >= 500 && response.status <= 599) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.ERROR, list: [t('general.server-error')] }
            });
        }

        setSubmitting(false);
    }, [searchParams, t]);

    return (
        <Panel
            title={t('layouts.reset-password.panel-header')}
            onSubmit={resetPasswordRequest}>
            <BlockMessage
                style={blockMessageStyle}
                state={messageState} />
            <CustomInput
                containerStyle={passwordInfoInputStyle}
                appearanceMode={CustomElementAppearanceModes.CREDENTIALS}
                id='resetPassword-newPassword-input'
                name='newPassword'
                label={t('layouts.reset-password.password-input')}
                type='password'
                autoComplete='new-password'
                placeholder={t('layouts.reset-password.password-input')}
                pattern='^(?=.*\p{Nd})(?=.*\p{Lu})(?=.*\p{Ll}).+$'
                minLength='6'
                maxLength='200'
                required
                valueMissingValidity={t('layouts.reset-password.new_password_invalid.value_missing')}
                tooShortValidity={t('layouts.reset-password.new_password_invalid.too_short')}
                patternValidity={t('layouts.reset-password.new_password_invalid.pattern')} />
            <CustomInput
                containerStyle={confirmPasswordInfoInputStyle}
                id='resetPassword-confirmPassword-input'
                name='confirmPassword'
                label={t('layouts.reset-password.confirm-password-input')}
                type='password'
                autoComplete='off'
                placeholder={t('layouts.reset-password.confirm-password-input')}
                maxLength='200'
                required
                valueMissingValidity={t(`layouts.reset-password.confirm_password_invalid.value_missing`)} />
            <PanelButton
                style={submitButtonStyle}
                text={t('layouts.reset-password.submit')}
                loading={submitting}
                disabled={submitting} />
        </Panel>
    );
}

export default ResetPasswordLayout;
