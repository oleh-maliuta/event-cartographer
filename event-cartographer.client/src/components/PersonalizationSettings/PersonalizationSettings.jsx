import { memo } from 'react';
import cl from './.module.css';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { LocalStorageKeys, ThemeValues, TIME_ZONES } from '../../utils/constants';
import { useTimeZone } from '../../hooks/useTimeZone';

const PersonalizationSettings = memo(() => {
    const { t, i18n } = useTranslation();

    const { theme, isDeviceTheme, setThemeMode } = useTheme();
    const { timeZone, setTimeZoneMode } = useTimeZone();

    return (
        <div className={`${cl.personalization} ${cl[theme]}`}>
            <div className={`${cl.personalization__header__cont}`}>
                <h2 className={`${cl.personalization__header}`}>
                    {t('components.personalization-settings.header')}
                </h2>
                <div className={cl.data_input}>
                    <label className={cl.data_input__label}>
                        {t('components.personalization-settings.time-zone-input')}
                    </label>
                    <select className={cl.data_input__input}
                        defaultValue={localStorage.getItem(LocalStorageKeys.TIME_ZONE) || undefined}
                        onChange={(e) => {
                            setTimeZoneMode(e.target.value);
                        }}>
                        <option key='auto' className={cl.data_input__input__option}
                            value='auto'>
                            {t('components.personalization-settings.auto-time-zone')}: (UTC {timeZone.offset}) {timeZone.name.replace(/_/g, ' ')}
                        </option>
                        {
                            TIME_ZONES.map(tz => (
                                <option key={tz.name} className={cl.data_input__input__option}
                                    value={tz.name}>
                                    (UTC {tz.offset}) {tz.name.replace(/_/g, ' ')}
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div className={cl.data_input}>
                    <label className={cl.data_input__label}>
                        {t('components.personalization-settings.language-input')}
                    </label>
                    <select className={cl.data_input__input}
                        defaultValue={i18n.language}
                        onChange={(e) => {
                            localStorage.setItem(LocalStorageKeys.LANGUAGE, e.target.value);
                            i18n.changeLanguage(e.target.value);
                        }}>
                        <option className={cl.data_input__input__option}
                            value="en">
                            {t('components.personalization-settings.en-language-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value="ru">
                            {t('components.personalization-settings.ru-language-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value="ua">
                            {t('components.personalization-settings.ua-language-value')}
                        </option>
                    </select>
                </div>
                <div className={cl.data_input}>
                    <label className={cl.data_input__label}>
                        {t('components.personalization-settings.theme-input')}
                    </label>
                    <select className={cl.data_input__input}
                        defaultValue={isDeviceTheme ? "device" : theme}
                        onChange={(e) => {
                            setThemeMode(e.target.value);
                        }}>
                        <option className={cl.data_input__input__option}
                            value="device">
                            {t('components.personalization-settings.device-theme-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value={ThemeValues.LIGHT}>
                            {t('components.personalization-settings.light-theme-value')}
                        </option>
                        <option className={cl.data_input__input__option}
                            value={ThemeValues.DARK}>
                            {t('components.personalization-settings.dark-theme-value')}
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
