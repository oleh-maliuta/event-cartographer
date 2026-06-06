import { useState, useRef, useEffect, memo, useReducer } from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { useTranslation } from 'react-i18next';
import Switch from '../Switch/Switch';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import { messageListReducer, messageListState } from '../../utils/reducers/messageListReducer';
import { MessageStates } from '../../utils/constants';

const blockMessageStyle = { marginTop: '10px', width: 'calc(100% - 6px)' };

const BasicUserInfoSettings = memo(() => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [permissionToDeletePastEventsValue, setPermissionToDeletePastEventsValue] = useState(null);

    const [messageState, dispatchMessageState] = useReducer(
        messageListReducer,
        messageListState(),
    );

    const usernameInputRef = useRef(null);

    const { theme } = useTheme();

    async function loadUserInfo() {
        const response = await fetch(`/api/users/self`, {
            method: "GET",
            credentials: "include"
        });
        const json = await response.json();

        setUserData(json.data || undefined);

        if (json.data) {
            setPermissionToDeletePastEventsValue(json.data.permissionToDeletePastEvents);
        }
    }

    async function updateUserInfoRequest() {
        setLoading(true);

        const response = await fetch(`/api/users/info`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: usernameInputRef.current.value || null,
                permissionToDeletePastEvents: permissionToDeletePastEventsValue
            })
        });
        const json = await response.json();

        if (response.ok) {
            dispatchMessageState({
                type: 'SET_MESSAGES', payload: {
                    mode: MessageStates.SUCCESS,
                    list: [t('settings.basic-info.changes-are-saved')]
                }
            });
        } else if (!response.ok) {
            if (json.message) {
                dispatchMessageState({
                    type: 'SET_MESSAGES', payload: {
                        mode: MessageStates.ERROR,
                        list: [t(json.message)]
                    }
                });
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                dispatchMessageState({
                    type: 'SET_MESSAGES', payload: {
                        mode: MessageStates.ERROR,
                        list: errors
                    }
                });
            }
        } else if (response.status >= 500 && response.status <= 599) {
            dispatchMessageState({
                type: 'SET_MESSAGES', payload: {
                    mode: MessageStates.ERROR,
                    list: [t('general.server-error')]
                }
            });
        }

        setLoading(false);
    }

    useEffect(() => {
        loadUserInfo();
    }, []);

    if (userData === null) {
        return (
            <div className={cl.content_loading}>
                <LoadingAnimation
                    size="50px"
                    curveWidth="10px" />
            </div>
        );
    }

    return (
        <form className={`${cl.basic_info} ${cl[theme]}`}
            onSubmit={(e) => {
                e.preventDefault();
                if (loading) return;
                updateUserInfoRequest();
            }}>
            <div className={`${cl.basic_info__header__cont}`}>
                <h2 className={`${cl.basic_info__header}`}>
                    {t('settings.basic-info.header')}
                </h2>
            </div>
            <div className={cl.data_input}>
                <label className={cl.data_input__label}>
                    {t('settings.basic-info.username-input')}
                </label>
                <input className={cl.data_input__input}
                    type="text"
                    placeholder={t('settings.basic-info.username-input')}
                    minLength='3'
                    maxLength="100"
                    defaultValue={userData.name}
                    required
                    ref={usernameInputRef} />
            </div>
            <div className={cl.data_input}>
                <label className={cl.data_input__label}>
                    {t('settings.basic-info.permission-to-delete-past-events-input')}
                </label>
                <Switch
                    value={permissionToDeletePastEventsValue}
                    setValue={setPermissionToDeletePastEventsValue} />
            </div>
            <BlockMessage
                style={blockMessageStyle}
                state={messageState} />
            <button className={cl.save_changes_button}
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
                            {t('settings.basic-info.save-changes')}
                        </span>
                }
            </button>
            <div className={`${cl.normal_sep_line__cont}`}>
                <div className={`${cl.normal_sep_line}`} />
            </div>
        </form>
    );
});

BasicUserInfoSettings.displayName = 'BasicUserInfoSettings';

export default BasicUserInfoSettings;
