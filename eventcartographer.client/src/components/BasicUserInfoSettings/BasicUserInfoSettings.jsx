import React from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { API_PORT, HOST } from '../../constants';

const BasicUserInfoSettings = React.memo(() => {
    const [savingChangesForUserInfo, setSavingChangesForUserInfo] = React.useState(false);
    const [userInfo, setUserInfo] = React.useState(null);

    const usernameInputRef = React.useRef(null);

    async function loadUserInfo() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/self`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });
        const json = await response.json();

        setUserInfo(json.data || undefined);
    }

    async function updateUserInfoRequest() {
        setSavingChangesForUserInfo(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/info`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: usernameInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert("Changes are saved.");
        } else if (!response.ok) {
            if (json.message) {
                alert(json.message);
            } else {
                let errors = "";
                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors += `${json.errors[prop][err]}\n`;
                    }
                }
                errors = errors.slice(0, -1);
                alert(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            alert("Server error.");
        }

        setSavingChangesForUserInfo(false);
    }

    React.useEffect(() => {
        loadUserInfo();
    }, []);

    if (userInfo === null) {
        return (
            <div className={cl.content_loading}>
                <LoadingAnimation
                    size="50px"
                    curveWidth="10px" />
            </div>
        );
    }

    return (
        <div className={`${cl.panel__basic_info}`}>
            <div className={`${cl.panel__basic_info__header__cont}`}>
                <h2 className={`${cl.panel__basic_info__header}`}>Basic info</h2>
            </div>
            <div className={cl.data_input}>
                <label className={cl.data_input__label}>Username</label>
                <input className={cl.data_input__input}
                    type="text"
                    placeholder="Username"
                    maxLength="100"
                    defaultValue={userInfo.name}
                    ref={usernameInputRef} />
            </div>
            <button className={cl.save_changes_button}
                onClick={() => {
                    if (!savingChangesForUserInfo) {
                        updateUserInfoRequest();
                    }
                }}>
                {
                    savingChangesForUserInfo ?
                        <LoadingAnimation
                            curveColor1="#FFFFFF"
                            curveColor2="#00000000"
                            size="20px"
                            curveWidth="3px" />
                        :
                        <span>Save changes</span>
                }
            </button>
        </div>
    );
});

BasicUserInfoSettings.displayName = 'BasicUserInfoSettings';

export default BasicUserInfoSettings;
