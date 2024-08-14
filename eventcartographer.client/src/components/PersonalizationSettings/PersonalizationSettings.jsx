import React from 'react';
import cl from './.module.css';
import { useTranslation } from 'react-i18next';
import useTheme from '../../hooks/useTheme';

const PersonalizationSettings = React.memo(() => {
    const { t, i18n } = useTranslation();

    const theme = useTheme();

    return (
        <div className={`${cl.personalization} ${cl[theme.ls ?? theme.cs]}`}>
            <div className={`${cl.personalization__header__cont}`}>
                <h2 className={`${cl.personalization__header}`}>
                    {t('settings.personalization.header')}
                </h2>
                <div className={cl.data_input}>
                    <label className={cl.data_input__label}>
                        {t('settings.personalization.language-input')}
                    </label>
                    <select className={cl.data_input__input}
                        defaultValue={i18n.language}
                        onChange={(e) => {
                            localStorage.setItem('language', e.target.value);
                            i18n.changeLanguage(e.target.value);
                        }}>
                        <option className={cl.data_input__input__option}
                            value="en">
                            {t('settings.personalization.en-language-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value="ru">
                            {t('settings.personalization.ru-language-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value="ua">
                            {t('settings.personalization.ua-language-value')}
                        </option>
                    </select>
                </div>
                <div className={cl.data_input}>
                    <label className={cl.data_input__label}>
                        {t('settings.personalization.theme-input')}
                    </label>
                    <select className={cl.data_input__input}
                        defaultValue={theme.ls ?? "device"}
                        onChange={(e) => {
                            if (e.target.value === "device") {
                                localStorage.removeItem('theme');
                            } else {
                                localStorage.setItem('theme', e.target.value);
                            }
                            window.location.reload();
                        }}>
                        <option className={cl.data_input__input__option}
                            value="device">
                            {t('settings.personalization.device-theme-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value="light">
                            {t('settings.personalization.light-theme-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value="dark">
                            {t('settings.personalization.dark-theme-value')}
                        </option>
                    </select>
                </div>
            </div>
            <div className={`${cl.normal_sep_line__cont}`}>
                <div className={`${cl.normal_sep_line}`} />
            </div>
        </div>
    );
});

PersonalizationSettings.displayName = 'PersonalizationSettings';

export default PersonalizationSettings;
