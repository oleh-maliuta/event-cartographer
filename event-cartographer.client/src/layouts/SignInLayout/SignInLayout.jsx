import { useState, useCallback, useReducer, useEffect } from 'react';
import cl from './.module.css';
import Panel from '../../components/Panel/Panel';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import { useTranslation } from 'react-i18next';
import ResetPasswordDialog from '../../components/ResetPasswordDialog/ResetPasswordDialog';
import BlockMessage from '../../components/BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import MemoLink from '../../components/MemoLink/MemoLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { messageListReducer, messageListState } from '../../utils/reducers/messageListReducer';
import { MessageStates } from '../../utils/constants';

const blockMessageStyle = { marginTop: '15px', width: 'calc(100% - 6px)' };
const usernameInfoInputStyle = { marginTop: '15px' };
const passwordInfoInputStyle = { marginTop: '20px' };
const submitButtonStyle = { marginTop: '35px' };

const SignInLayout = () => {
    const { t } = useTranslation();

    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState(),
    );

    const { theme } = useTheme();

    const location = useLocation();
    const navigate = useNavigate();

    const signInRequest = useCallback(async (e) => {
        e.preventDefault();
        dispatchMessageState({ type: 'CLEAR_MESSAGES' });
        setSubmitting(true);

        const response = await fetch('/api/auth/sign-in', {
            method: "POST",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            navigate('/');
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
    }, [t, navigate]);

    useEffect(() => {
        const set = () => {
            setIsDialogOpen(location.hash === '#reset-password-dialog');
        };
        set();
    }, [location.hash]);

    return (
        <div className={`${cl.main} ${cl[theme]}`}>
            <Panel
                title={t('sign-in.panel-header')}
                onSubmit={signInRequest}>
                <BlockMessage
                    style={blockMessageStyle}
                    state={messageState} />
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
                    <MemoLink className={cl.forgot_password_link}
                        to='#reset-password-dialog'
                        replace={true}>
                        {t('sign-in.forgot-password')}
                    </MemoLink>
                </div>
                <PanelButton
                    style={submitButtonStyle}
                    text={t('sign-in.submit')}
                    loading={submitting}
                    disabled={submitting} />
                <div className={cl.sign_up_link_cont}>
                    <MemoLink className={cl.sign_up_link} to='/sign-up'>
                        {t('sign-in.sign-up-link')}
                    </MemoLink>
                </div>
            </Panel>
            <ResetPasswordDialog
                dialogState={isDialogOpen}
                setDialogState={setIsDialogOpen} />
        </div>
    );
}

export default SignInLayout;
