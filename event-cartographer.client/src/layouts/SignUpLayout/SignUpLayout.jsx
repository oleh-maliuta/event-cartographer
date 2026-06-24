import { useState, useCallback, useReducer, useEffect, useMemo } from "react";
import cl from "./.module.css";
import Panel from "../../components/Panel/Panel";
import PanelInput from "../../components/PanelInput/PanelInput";
import PanelButton from "../../components/PanelButton/PanelButton";
import { useTranslation } from "react-i18next";
import BlockMessage from "../../components/BlockMessage/BlockMessage";
import { useTheme } from '../../hooks/useTheme';
import MemoLink from "../../components/MemoLink/MemoLink";
import { messageListReducer, messageListState } from "../../utils/reducers/messageListReducer";
import { MessageStates, PanelInputAppearanceModes } from "../../utils/constants";
import ResendConfirmationEmailDialog from "../../components/ResendConfirmationEmailDialog/ResendConfirmationEmailDialog";
import { useLocation } from "react-router-dom";

const blockMessageStyle = { marginTop: '20px', width: 'calc(100% - 6px)' };
const usernameInfoInputStyle = { marginTop: '15px' };
const emailInfoInputStyle = { marginTop: '15px' };
const passwordInfoInputStyle = { marginTop: '15px' };
const confirmPasswordInfoInputStyle = { marginTop: '15px' };
const submitButtonStyle = { marginTop: '30px' };

const SignUpLayout = () => {
    const { t, i18n } = useTranslation();

    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [passwordValue, setPasswordValue] = useState('');
    const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

    const location = useLocation();

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState()
    );

    const { theme } = useTheme();

    const isPasswordConfirmed = useMemo(() => {
        return confirmPasswordValue === passwordValue
    }, [confirmPasswordValue, passwordValue]);

    const signUpRequest = useCallback(async (e) => {
        e.preventDefault();

        if (!isPasswordConfirmed) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.ERROR, list: [t('layouts.sign-up.password-not-confirmed')] }
            });
            return;
        } else {
            dispatchMessageState({ type: 'CLEAR_MESSAGES' });
        }

        setSubmitting(true);

        const response = await fetch(`/api/auth/sign-up?locale=${i18n.language}`, {
            method: "POST",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.SUCCESS, list: [t('layouts.sign-up.registered')] }
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
    }, [i18n.language, isPasswordConfirmed, t]);

    useEffect(() => {
        const set = () => {
            setIsDialogOpen(location.hash === '#resend-email-dialog');
        };
        set();
    }, [location.hash]);

    return (
        <div className={`${cl.main} ${cl[theme]}`}>
            <Panel
                title={t('layouts.sign-up.panel-header')}
                onSubmit={signUpRequest}>
                <BlockMessage
                    style={blockMessageStyle}
                    state={messageState} />
                <PanelInput
                    containerStyle={usernameInfoInputStyle}
                    appearanceMode={PanelInputAppearanceModes.CREDENTIALS}
                    id='signUp-username-input'
                    name='username'
                    label={t('layouts.sign-up.username-input')}
                    type='text'
                    autoComplete='off'
                    placeholder={t('layouts.sign-up.username-input')}
                    pattern="^[^@]*$"
                    minLength='3'
                    maxLength='100'
                    required
                    valueMissingValidity={t('layouts.sign-up.username_invalid.value_missing')}
                    tooShortValidity={t('layouts.sign-up.username_invalid.too_short')}
                    patternValidity={t('layouts.sign-up.username_invalid.pattern')} />
                <PanelInput
                    containerStyle={emailInfoInputStyle}
                    appearanceMode={PanelInputAppearanceModes.CREDENTIALS}
                    id='signUp-email-input'
                    name='email'
                    label={t('layouts.sign-up.email-address-input')}
                    type='email'
                    autoComplete='username'
                    placeholder={t('layouts.sign-up.email-address-input')}
                    maxLength='320'
                    required
                    valueMissingValidity={t('layouts.sign-up.email_invalid.value_missing')}
                    typeMismatchValidity={t('layouts.sign-up.email_invalid.type_mismatch')} />
                <PanelInput
                    containerStyle={passwordInfoInputStyle}
                    appearanceMode={PanelInputAppearanceModes.CREDENTIALS}
                    id='signUp-password-input'
                    name='password'
                    label={t('layouts.sign-up.password-input')}
                    type='password'
                    autoComplete='new-password'
                    placeholder={t('layouts.sign-up.password-input')}
                    pattern="^(?=.*\p{Nd})(?=.*\p{Lu})(?=.*\p{Ll}).+$"
                    minLength='6'
                    maxLength='200'
                    required
                    value={passwordValue}
                    setValue={setPasswordValue}
                    valueMissingValidity={t('layouts.sign-up.password_invalid.value_missing')}
                    tooShortValidity={t('layouts.sign-up.password_invalid.too_short')}
                    patternValidity={t('layouts.sign-up.password_invalid.pattern')} />
                <PanelInput
                    containerStyle={confirmPasswordInfoInputStyle}
                    appearanceMode={PanelInputAppearanceModes.CREDENTIALS}
                    id='signUp-confirmPassword-Input'
                    label={t('layouts.sign-up.confirm-password-input')}
                    type='password'
                    autoComplete='off'
                    placeholder={t('layouts.sign-up.confirm-password-input')}
                    maxLength='200'
                    required
                    value={confirmPasswordValue}
                    setValue={setConfirmPasswordValue}
                    valueMissingValidity={t('layouts.sign-up.confirm_password_invalid.value_missing')} />
                <PanelButton
                    style={submitButtonStyle}
                    text={t('layouts.sign-up.create-account')}
                    loading={submitting}
                    disabled={submitting} />
                <div className={cl.resend_email_link_cont}>
                    <MemoLink className={`${cl.resend_email_link}`}
                        to='#resend-email-dialog'
                        replace={true}>
                        {t('layouts.sign-up.resend-email-link')}
                    </MemoLink>
                </div>
                <div className={cl.sign_in_link_cont}>
                    <MemoLink className={cl.sign_in_link}
                        to='/sign-in'>
                        {t('layouts.sign-up.sign-in-link')}
                    </MemoLink>
                </div>
            </Panel>
            <ResendConfirmationEmailDialog
                dialogState={isDialogOpen}
                setDialogState={setIsDialogOpen} />
        </div>
    );
}

export default SignUpLayout;
