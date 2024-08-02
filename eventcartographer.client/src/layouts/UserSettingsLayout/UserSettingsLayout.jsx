import cl from './.module.css';
import { CLIENT_PORT, HOST } from "../../constants";
import BasicUserInfoSettings from "../../components/BasicUserInfoSettings/BasicUserInfoSettings";
import EmailAddressUserSettings from "../../components/EmailAddressUserSettings/EmailAddressUserSettings";
import PasswordUserSettings from "../../components/PasswordUserSettings/PasswordUserSettings";
import DeleteUserAccountSettings from "../../components/DeleteUserAccountSettings/DeleteUserAccountSettings";

const UserSettingsLayout = () => {
    return (
        <div className={`${cl.main}`}>
            <div className={cl.panel}>
                <div className={`${cl.panel__page_header}`}>
                    <h1 className={`${cl.panel__page_header__text}`}>
                        Settings
                    </h1>
                    <div className={cl.panel__page_header__control}>
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
                <BasicUserInfoSettings />
                <div className={`${cl.panel__normal_sep_line__cont}`}>
                    <div className={`${cl.panel__normal_sep_line}`} />
                </div>
                <div className={`${cl.panel__other_settings}`}>
                    <div className={`${cl.panel__other_settings__header__cont}`}>
                        <h2 className={`${cl.panel__other_settings__header}`}>Other</h2>
                    </div>
                    <EmailAddressUserSettings />
                    <PasswordUserSettings />
                    <DeleteUserAccountSettings />
                </div>
            </div>
        </div>
    );
}

export default UserSettingsLayout;
