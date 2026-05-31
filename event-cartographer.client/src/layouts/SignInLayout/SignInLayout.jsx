import { useState, useMemo, useCallback } from 'react';
import cl from './.module.css';
import Panel from '../../components/Panel/Panel';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import { useTranslation } from 'react-i18next';
import ResetPasswordDialog from '../../components/ResetPasswordDialog/ResetPasswordDialog';
import BlockMessage from '../../components/BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import MemoLink from '../../components/MemoLink/MemoLink';
import { useNavigate } from 'react-router-dom';

const SignInLayout = () => {
    const { t } = useTranslation();

    const [messages, setMessages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpened, setDialogOpened] = useState(false);

    const { theme } = useTheme();

    const blockMessageStyle = useMemo(() => {
        return { marginTop: '15px', width: 'calc(100% - 6px)' };
    }, []);
    const usernameInfoInputStyle = useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const passwordInfoInputStyle = useMemo(() => {
        return { marginTop: '20px' };
    }, []);
    const submitButtonStyle = useMemo(() => {
        return { marginTop: '35px' };
    }, []);

    const navigate = useNavigate();

    const signInRequest = useCallback(async (e) => {
        setMessages([]);
        setSubmitting(true);

        const response = await fetch('/api/users/sign-in', {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            navigate('/');
        } else if (!response.ok) {
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
            setMessages([t('general.server-error')]);
        }

        setSubmitting(false);
    }, [t, navigate]);

    return (
        <div className={`${cl.main} ${cl[theme]}`}>
            <Panel
                title={t('sign-in.panel-header')}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (submitting) return;
                    signInRequest(e);
                }}>
                <BlockMessage
                    style={blockMessageStyle}
                    state='error'
                    messages={messages} />
                <PanelInput
                    containerStyle={usernameInfoInputStyle}
                    name='usernameOrEmail'
                    label={t('sign-in.username-or-email-input')}
                    type='text'
                    placeholder={t('sign-in.username-or-email-input')}
                    maxLength='100'
                    required
                    valueMissingValidity={t(`sign-in.username_or_email_invalid.value_missing`)} />
                <PanelInput
                    containerStyle={passwordInfoInputStyle}
                    name='password'
                    label={t('sign-in.password-input')}
                    type='password'
                    placeholder={t('sign-in.password-input')}
                    maxLength='200'
                    required
                    valueMissingValidity={t(`sign-in.password_invalid.value_missing`)} />
                <div className={cl.forgot_password_link_cont}>
                    <span className={cl.forgot_password_link}
                        onClick={() => setDialogOpened(true)}>
                        {t('sign-in.forgot-password')}
                    </span>
                </div>
                <PanelButton
                    style={submitButtonStyle}
                    text={t('sign-in.submit')}
                    loading={submitting} />
                <div className={cl.sign_up_link_cont}>
                    <MemoLink className={cl.sign_up_link} to='/sign-up'>
                        {t('sign-in.sign-up-link')}
                    </MemoLink>
                </div>
            </Panel>
            <ResetPasswordDialog
                dialogState={dialogOpened}
                setDialogState={setDialogOpened} />
        </div>
    );
}

export default SignInLayout;
