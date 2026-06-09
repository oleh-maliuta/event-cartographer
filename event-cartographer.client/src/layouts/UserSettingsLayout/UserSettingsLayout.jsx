import cl from './.module.css';
import BasicUserInfoSettings from "../../components/BasicUserInfoSettings/BasicUserInfoSettings";
import EmailAddressUserSettings from "../../components/EmailAddressUserSettings/EmailAddressUserSettings";
import PasswordUserSettings from "../../components/PasswordUserSettings/PasswordUserSettings";
import DeleteUserAccountSettings from "../../components/DeleteUserAccountSettings/DeleteUserAccountSettings";
import { useTranslation } from 'react-i18next';
import PersonalizationSettings from '../../components/PersonalizationSettings/PersonalizationSettings';
import { useTheme } from '../../hooks/useTheme';
import MemoLink from '../../components/MemoLink/MemoLink';
import { PageRoutes } from '../../utils/constants';

const UserSettingsLayout = () => {
    const { t } = useTranslation();

    const { theme } = useTheme();

    return (
        <div className={`${cl.main} ${cl[theme]}`}>
            <div className={cl.panel}>
                <div className={`${cl.panel__page_header}`}>
                    <h1 className={`${cl.panel__page_header__text}`}>
                        {t('settings.header')}
                    </h1>
                    <div className={cl.panel__page_header__control}>
                        <MemoLink className={cl.panel__page_header__map_button} to={PageRoutes.HOME}>
                            <img className={cl.panel__page_header__map_button__img}
                                alt="map" />
                        </MemoLink>
                    </div>
                </div>
                <div className={`${cl.panel__page_header__sep_line__cont}`}>
                    <div className={`${cl.panel__page_header__sep_line}`} />
                </div>
                <BasicUserInfoSettings />
                <PersonalizationSettings />
                <div className={`${cl.panel__security_settings}`}>
                    <div className={`${cl.panel__security_settings__header}`}>
                        <h2 className={`${cl.panel__security_settings__header__text}`}>
                            {t('settings.security')}
                        </h2>
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
