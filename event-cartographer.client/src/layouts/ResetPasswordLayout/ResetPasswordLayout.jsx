import { useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import Panel from '../../components/Panel/Panel';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../../components/BlockMessage/BlockMessage';

const ResetPasswordLayout = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    const [messageState, setMessageState] = useState('success');
    const [messages, setMessages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [isReset, setIsReset] = useState(false);

    const passwordInputRef = useRef(null);
    const confirmPasswordInputRef = useRef(null);

    const blockMessageStyle = useMemo(() => {
        return { marginTop: '15px', width: 'calc(100% - 6px)' };
    }, []);
    const passwordInfoInputStyle = useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const confirmPasswordInfoInputStyle = useMemo(() => {
        return { marginTop: '20px' };
    }, []);
    const submitButtonStyle = useMemo(() => {
        return { marginTop: '35px' };
    }, []);

    const resetPasswordRequest = useCallback(async (e) => {
        setMessages([]);
        setSubmitting(true);

        const formData = new FormData(e.target);
        formData.append('username', searchParams.get('user') || null);
        formData.append('token', searchParams.get('token') || null);

        const response = await fetch('/api/users/reset-password', {
            method: "PUT",
            credentials: "include",
            body: formData
        });
        const json = await response.json();

        if (response.ok) {
            setMessageState('success');
            setMessages([t('reset-password.password-is-reset')]);
            setIsReset(true);
        } else if (!response.ok) {
            setMessageState('error');
            if (json.message) {
                setMessages([t(json.message)]);
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                if (errors.length > 0) {
                    setMessages(errors);
                }
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setMessageState('error');
            setMessages([t('general.server-error')]);
        }

        setSubmitting(false);
    }, [searchParams, t]);

    return (
        <Panel
            title={t('reset-password.panel-header')}
            onSubmit={(e) => {
                e.preventDefault();
                if (isReset) return;
                if (submitting) return;
                if (confirmPasswordInputRef.current.value !== passwordInputRef.current.value) {
                    setMessageState('error');
                    setMessages([t('reset-password.password-not-confirmed')]);
                    return;
                }
                resetPasswordRequest(e);
            }}>
            <BlockMessage
                style={blockMessageStyle}
                state={messageState}
                messages={messages} />
            <PanelInput
                containerStyle={passwordInfoInputStyle}
                name='newPassword'
                label={t('reset-password.password-input')}
                type='password'
                placeholder={t('reset-password.password-input')}
                pattern="^(?=.*\p{Nd})(?=.*\p{Lu})(?=.*\p{Ll}).+$"
                minLength='6'
                maxLength='200'
                required
                ref={passwordInputRef}
                valueMissingValidity={t(`reset-password.new_password_invalid.value_missing`)}
                tooShortValidity={t(`reset-password.new_password_invalid.too_short`)}
                patternValidity={t(`reset-password.new_password_invalid.pattern`)} />
            <PanelInput
                containerStyle={confirmPasswordInfoInputStyle}
                label={t('reset-password.confirm-password-input')}
                type='password'
                placeholder={t('reset-password.confirm-password-input')}
                maxLength='200'
                required
                ref={confirmPasswordInputRef}
                valueMissingValidity={t(`reset-password.confirm_password_invalid.value_missing`)} />
            <PanelButton
                style={submitButtonStyle}
                text={t('reset-password.submit')}
                loading={submitting} />
        </Panel>
    );
}

export default ResetPasswordLayout;
