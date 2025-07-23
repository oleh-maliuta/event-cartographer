import React from 'react';
import cl from './.module.css';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import Panel from '../../components/Panel/Panel';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResetPasswordDialog from '../../components/ResetPasswordDialog/ResetPasswordDialog';
import BlockMessage from '../../components/BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';

const SignInLayout = () => {
    const { t } = useTranslation();

    const [messages, setMessages] = React.useState([]);
    const [submitting, setSubmitting] = React.useState(false);
    const [dialogOpened, setDialogOpened] = React.useState(false);

    const panelButtonRef = React.useRef(null);

    const { theme } = useTheme();

    const blockMessageStyle = React.useMemo(() => {
        return { marginTop: '15px', width: 'calc(100% - 6px)' };
    }, []);
    const usernameInfoInputStyle = React.useMemo(() => {
        return { marginTop: '15px' };
    }, []);
    const passwordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '20px' };
    }, []);
    const submitButtonStyle = React.useMemo(() => {
        return { marginTop: '35px' };
    }, []);

    const signInRequest = React.useCallback(async (e) => {
        setMessages([]);
        setSubmitting(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/sign-in`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            window.location.href = `${HOST}:${CLIENT_PORT}`;
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
    }, [t]);

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
                    label={t('sign-in.username-input')}
                    type='text'
                    placeholder={t('sign-in.username-input')}
                    maxLength='100'
                    required />
                <PanelInput
                    containerStyle={passwordInfoInputStyle}
                    name='password'
                    label={t('sign-in.password-input')}
                    type='password'
                    placeholder={t('sign-in.password-input')}
                    maxLength='200'
                    required />
                <PanelButton
                    style={submitButtonStyle}
                    text={t('sign-in.submit')}
                    loading={submitting}
                    ref={panelButtonRef} />
                <div className={cl.options}>
                    <Link className={cl.options_sign_up_link}
                        to='/sign-up'>
                        {t('sign-in.sign-up-link')}
                    </Link>
                    <span className={cl.options_forgot_password_link}
                        onClick={() => setDialogOpened(true)}>
                        {t('sign-in.forgot-password')}
                    </span>
                </div>
            </Panel>
            <ResetPasswordDialog
                dialogState={dialogOpened}
                setDialogState={setDialogOpened} />
        </div>
    );
}

export default SignInLayout;
