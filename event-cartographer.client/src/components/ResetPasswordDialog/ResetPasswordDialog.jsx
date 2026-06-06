import { useState, useRef, useEffect, memo, useReducer } from 'react';
import cl from './.module.css';
import PropTypes from "prop-types";
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import { messageListReducer, messageListState } from '../../utils/reducers/messageListReducer';
import { MessageStates } from '../../utils/constants';

const blockMessageStyle = { marginTop: '10px' };

const ResetPasswordDialog = memo(({
    dialogState,
    setDialogState
}) => {
    const { t, i18n } = useTranslation();

    const [sendingEmail, setSendingEmail] = useState(false);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState()
    );

    const dialogRef = useRef(null);

    const { theme } = useTheme();

    async function resetPasswordPermissionRequest(e) {
        setSendingEmail(true);

        const response = await fetch(`/api/users/reset-password-permission?locale=${i18n.language}`, {
            method: "POST",
            credentials: "include",
            body: new FormData(e.target)
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.SUCCESS, list: [t('sign-in.reset-password-modal-window.email-is-sent')] }
            });
            setDialogState(false);
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
                        errors.push(`${t(json.errors[prop][err])}`);
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

        setSendingEmail(false);
    }

    useEffect(() => {
        if (dialogState) {
            dialogRef.current.showModal();
        } else {
            dialogRef.current.close();
        }
    }, [dialogState]);

    return (
        <dialog className={`${cl.modal_window} ${cl[theme]}`}
            ref={dialogRef}
            onCancel={() => setDialogState(false)}>
            <form className={`${cl.modal_window__form}`}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (sendingEmail) return;
                    resetPasswordPermissionRequest(e);
                }}>
                <div className={`${cl.modal_window__content}`}>
                    <h1 className={`${cl.modal_window__header}`}>
                        {t('sign-in.reset-password-modal-window.header')}
                    </h1>
                    <p className={`${cl.modal_window__reset_password__description}`}>
                        {t('sign-in.reset-password-modal-window.description')}
                    </p>
                    <BlockMessage
                        style={blockMessageStyle}
                        state={messageState} />
                    <input className={`${cl.modal_window__reset_password__input}`}
                        name='usernameOrEmail'
                        type="text"
                        placeholder={t('sign-in.reset-password-modal-window.username-or-email-input')}
                        maxLength="500"
                        required />
                </div>
                <div className={`${cl.modal_window__control}`}>
                    <div className={`${cl.modal_window__control__buttons}`}>
                        <button className={`${cl.modal_window__control__buttons__cancel}`}
                            type='button'
                            onClick={() => setDialogState(false)}>
                            {t('sign-in.reset-password-modal-window.cancel')}
                        </button>
                        <button className={`${cl.modal_window__control__buttons__apply}`}
                            type='submit'>
                            {
                                sendingEmail ?
                                    <LoadingAnimation
                                        curveColor1="#FFFFFF"
                                        curveColor2="#00000000"
                                        size="15px"
                                        curveWidth="3px" />
                                    :
                                    <span>
                                        {t('sign-in.reset-password-modal-window.send-mail')}
                                    </span>
                            }
                        </button>
                    </div>
                </div>
            </form>
        </dialog>
    );
});

ResetPasswordDialog.displayName = "ResetPasswordDialog";

ResetPasswordDialog.propTypes = {
    dialogState: PropTypes.bool.isRequired,
    setDialogState: PropTypes.func.isRequired
};

export default ResetPasswordDialog;
