import React from "react";
import cl from './.module.css';
import { API_PORT, CLIENT_PORT, HOST } from "../../constants";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation";

const UserSettingsLayout = () => {
    const [savingChangesForUserInfo, setSavingChangesForUserInfo] = React.useState(false);
    const [updatingEmail, setUpdatingEmail] = React.useState(false);
    const [updatingPassword, setUpdatingPassword] = React.useState(false);
    const [deletingAccount, setDeletingAccount] = React.useState(false);
    const [userInfo, setUserInfo] = React.useState(null);
    const [modalWindowMode, setModalWindowMode] = React.useState(null);

    const usernameInputRef = React.useRef(null);
    const oldPasswordInputRef = React.useRef(null);
    const newPasswordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);
    const confirmAccountDeletionInputRef = React.useRef(null);

    const passwordInputRef = React.useRef(null);
    const newEmailInputRef = React.useRef(null);

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

    async function updateUserEmailRequest() {
        setUpdatingEmail(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/email`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: passwordInputRef.current.value || null,
                email: newEmailInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert("Email is sent.");
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

        setUpdatingEmail(false);
    }

    async function updateUserPasswordRequest() {
        setUpdatingPassword(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/password`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                oldPassword: oldPasswordInputRef.current.value || null,
                newPassword: newPasswordInputRef.current.value || null,
                confirmPassword: confirmPasswordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert("Password is changed.");
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

        setUpdatingPassword(false);
    }

    async function deleteAccountRequest() {
        setDeletingAccount(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/delete`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: confirmAccountDeletionInputRef.current.value || null,
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert("Account is deleted.");
            window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
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

        setDeletingAccount(false);
    }

    async function loadUserInfo() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/self`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });
        const json = await response.json();

        setUserInfo(json.data || undefined);
    }

    function renderModalWindow() {
        switch (modalWindowMode) {
            case 'delete-account':
                return (
                    <div className={`${cl.modal_window__background}`}
                        onClick={() => { setModalWindowMode(null); }}>
                        <div className={`${cl.modal_window}`}
                            onClick={(e) => { e.stopPropagation(); }}>
                            <div className={`${cl.modal_window__content}`}>
                                <h1 className={`${cl.modal_window__header}`}>Delete account</h1>
                                <div className={`${cl.modal_window__confirm_deletion__cont}`}>
                                    <p className={`${cl.modal_window__confirm_deletion__description}`}>
                                        Before deleting this account, you must
                                        to input the username below so we make sure you
                                        really want to do execute the operation.
                                    </p>
                                    <input className={`${cl.modal_window__confirm_deletion__input}`}
                                        type="text"
                                        placeholder="Username"
                                        maxLength="480"
                                        ref={confirmAccountDeletionInputRef} />
                                </div>
                            </div>
                            <div className={`${cl.modal_window__control}`}>
                                <div className={`${cl.modal_window__control__buttons}`}>
                                    <button className={`${cl.modal_window__control__buttons__cancel}`}
                                        onClick={() => { setModalWindowMode(null); }}>
                                        Cancel
                                    </button>
                                    <button className={`${cl.modal_window__control__buttons__apply}`}
                                        onClick={() => {
                                            if (confirmAccountDeletionInputRef.current.value === userInfo.name) {
                                                deleteAccountRequest();
                                            } else {
                                                alert("The operation is not confirmed.");
                                            }
                                        }}>
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    React.useEffect(() => {
        if (userInfo === null) {
            loadUserInfo();
        }
    });

    if (userInfo === null) {
        return (
            <div className={`${cl.main__loading}`}>
                <LoadingAnimation size="50px" curveWidth="10px" />
            </div>
        );
    }

    return (
        <div className={`${cl.main}`}>
            <div className={cl.panel}>
                <div className={`${cl.panel__page_header}`}>
                    <h1 className={`${cl.panel__page_header__text}`}>
                        Settings
                    </h1>
                    <div className={cl.panel__page_header__control}>
                        <button className={`${cl.panel__page_header__save_changes_button}`}
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
                        <button className={cl.panel__page_header__map_button}
                            onClick={() => window.location.href = `${HOST}:${CLIENT_PORT}`}>
                            <img className={cl.panel__page_header__map_button__img}
                                alt="map" />
                        </button>
                    </div>
                </div>
                <div className={`${cl.panel__page_header__sep_line__cont}`}>
                    <div className={`${cl.panel__page_header__sep_line}`} />
                </div>
                <div className={`${cl.panel__basic_info}`}>
                    <div className={`${cl.panel__basic_info__header__cont}`}>
                        <h2 className={`${cl.panel__basic_info__header}`}>Basic info</h2>
                    </div>
                    <div className={`${cl.panel__username__cont}`}>
                        <label className={`${cl.panel__username__label}`}>Username</label>
                        <input className={`${cl.panel__username__input}`}
                            type="text"
                            placeholder="Username"
                            maxLength="100"
                            defaultValue={userInfo.name}
                            ref={usernameInputRef} />
                    </div>
                </div>
                <div className={`${cl.panel__normal_sep_line__cont}`}>
                    <div className={`${cl.panel__normal_sep_line}`} />
                </div>
                <div className={`${cl.panel__other_settings}`}>
                    <div className={`${cl.panel__other_settings__header__cont}`}>
                        <h2 className={`${cl.panel__other_settings__header}`}>Other</h2>
                    </div>
                    <div className={cl.panel__other_settings__element}>
                        <div className={`${cl.panel__other_settings__element__content}`}>
                            <h3 className={`${cl.panel__other_settings__element__header}`}>
                                Change email
                            </h3>
                            <p className={`${cl.panel__other_settings__element__description}`}>
                                Input your password and a new email.
                                After that you will receive a mail in your new
                                email address to confirm it.
                            </p>
                            <input className={`${cl.panel__other_settings__element__input}`}
                                type="password"
                                placeholder="Password"
                                maxLength="200"
                                ref={passwordInputRef} />
                            <input className={`${cl.panel__other_settings__element__input}`}
                                type="email"
                                placeholder="New email address"
                                maxLength="320"
                                ref={newEmailInputRef} />
                        </div>
                        <div className={`${cl.panel__other_settings__element__control}`}>
                            <button className={`${cl.panel__other_settings__element__control__apply}`}
                                onClick={() => {
                                    if (!updatingEmail) {
                                        updateUserEmailRequest();
                                    }
                                }}>
                                {
                                    updatingEmail ?
                                        <LoadingAnimation
                                            curveColor1="#FFFFFF"
                                            curveColor2="#00000000"
                                            size="15px"
                                            curveWidth="3px" />
                                        :
                                        <span>Apply</span>
                                }
                            </button>
                        </div>
                    </div>
                    <div className={cl.panel__other_settings__element}>
                        <div className={`${cl.panel__other_settings__element__content}`}>
                            <h3 className={`${cl.panel__other_settings__element__header}`}>
                                Change password
                            </h3>
                            <input className={`${cl.panel__other_settings__element__input}`}
                                type="password"
                                placeholder="Old password"
                                maxLength="200"
                                ref={oldPasswordInputRef} />
                            <input className={`${cl.panel__other_settings__element__input}`}
                                type="password"
                                placeholder="New password"
                                maxLength="200"
                                ref={newPasswordInputRef} />
                            <input className={`${cl.panel__other_settings__element__input}`}
                                type="password"
                                placeholder="Confirm new password"
                                maxLength="200"
                                ref={confirmPasswordInputRef} />
                        </div>
                        <div className={`${cl.panel__other_settings__element__control}`}>
                            <button className={`${cl.panel__other_settings__element__control__apply}`}
                                onClick={() => {
                                    if (!updatingPassword) {
                                        updateUserPasswordRequest();
                                    }
                                }}>
                                {
                                    updatingPassword ?
                                        <LoadingAnimation
                                            curveColor1="#FFFFFF"
                                            curveColor2="#00000000"
                                            size="15px"
                                            curveWidth="3px" />
                                        :
                                        <span>Apply</span>
                                }
                            </button>
                        </div>
                    </div>
                    <div className={cl.panel__other_settings__element}>
                        <div className={`${cl.panel__other_settings__element__content}`}>
                            <h3 className={`${cl.panel__other_settings__element__header}`}>
                                Delete account
                            </h3>
                            <p className={`${cl.panel__other_settings__element__description}`}>
                                Before deleting this account, you must
                                to input the username below so we make sure you
                                really want to do execute the operation.
                            </p>
                            <input className={`${cl.panel__other_settings__element__input}`}
                                type="password"
                                placeholder="Password"
                                maxLength="200"
                                ref={confirmAccountDeletionInputRef} />
                        </div>
                        <div className={`${cl.panel__other_settings__element__control}`}>
                            <button className={`${cl.panel__other_settings__element__control__delete_account}`}
                                onClick={() => {
                                    if (!deletingAccount) {
                                        deleteAccountRequest();
                                    }
                                }}>
                                {
                                    deletingAccount ?
                                        <LoadingAnimation
                                            curveColor1="#FFFFFF"
                                            curveColor2="#00000000"
                                            size="15px"
                                            curveWidth="3px" />
                                        :
                                        <span>Delete</span>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserSettingsLayout;
