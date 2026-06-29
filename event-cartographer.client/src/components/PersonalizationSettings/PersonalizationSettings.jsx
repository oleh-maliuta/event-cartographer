import { memo, useCallback, useMemo } from 'react';
import cl from './.module.css';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { CustomElementAppearanceModes, LocalStorageKeys, ThemeValues, TIME_ZONES } from '../../utils/constants';
import { useTimeZone } from '../../hooks/useTimeZone';
import CustomSelect from '../CustomSelect/CustomSelect';

const formFieldStyle = { marginTop: '15px' };

function timeZoneSelectOptions() {
    return TIME_ZONES.map(tz => (
        <option key={tz.name} className={cl.data_input__input__option}
            value={tz.name}>
            (UTC {tz.offset}) {tz.name.replace(/_/g, ' ')}
        </option>
    ));
}

const PersonalizationSettings = memo(() => {
    const { t, i18n } = useTranslation();

    const { theme, isDeviceTheme, setThemeMode } = useTheme();
    const { timeZone, setTimeZoneMode } = useTimeZone();

    const autoTimeZoneOptionStr = useMemo(() =>
        `${t('components.personalization-settings.auto-time-zone')}: (UTC ${timeZone.offset}) ${timeZone.name.replace(/_/g, ' ')}`,
        [t, timeZone.name, timeZone.offset]);

    const onChangeTimeZoneEvent = useCallback(
        (e) => setTimeZoneMode(e.target.value), [setTimeZoneMode]);

    const onChangeLanguageEvent = useCallback((e) => {
        localStorage.setItem(LocalStorageKeys.LANGUAGE, e.target.value);
        i18n.changeLanguage(e.target.value);
    }, [i18n]);

    const onChangeThemeEvent = useCallback(
        (e) => setThemeMode(e.target.value), [setThemeMode]);

    return (
        <div className={`${cl.personalization} ${cl[theme]}`}>
            <div className={`${cl.personalization__header__cont}`}>
                <h2 className={`${cl.personalization__header}`}>
                    {t('components.personalization-settings.header')}
                </h2>
                <CustomSelect
                    containerStyle={formFieldStyle}
                    appearanceMode={CustomElementAppearanceModes.SETTINGS}
                    id='personalization-timeZone-select'
                    label={t('components.personalization-settings.time-zone-input')}
                    defaultValue={localStorage.getItem(LocalStorageKeys.TIME_ZONE) || undefined}
                    onChange={onChangeTimeZoneEvent}>
                    <option className={cl.data_input__input__option}
                        key='auto'
                        value='auto'>
                        {autoTimeZoneOptionStr}
                    </option>
                    {timeZoneSelectOptions()}
                </CustomSelect>
                <CustomSelect
                    containerStyle={formFieldStyle}
                    appearanceMode={CustomElementAppearanceModes.SETTINGS}
                    id='personalization-language-select'
                    label={t('components.personalization-settings.language-input')}
                    defaultValue={i18n.language}
                    onChange={onChangeLanguageEvent}>
                    <option className={cl.data_input__input__option}
                        value='en'>
                        {t('components.personalization-settings.en-language-value')}
                    </option>
                    <option className={cl.data_input__input__option}
                        value='ru'>
                        {t('components.personalization-settings.ru-language-value')}
                    </option>
                    <option className={cl.data_input__input__option}
                        value='ua'>
                        {t('components.personalization-settings.ua-language-value')}
                    </option>
                </CustomSelect>
                <CustomSelect
                    containerStyle={formFieldStyle}
                    appearanceMode={CustomElementAppearanceModes.SETTINGS}
                    id='personalization-theme-select'
                    label={t('components.personalization-settings.theme-input')}
                    defaultValue={isDeviceTheme ? "device" : theme}
                    onChange={onChangeThemeEvent}>
                    <option className={cl.data_input__input__option}
                        value="device">
                        {t('components.personalization-settings.default-theme-value')}
                    </option>
                    <option className={cl.data_input__input__option}
                        value={ThemeValues.LIGHT}>
                        {t('components.personalization-settings.light-theme-value')}
                    </option>
                    <option className={cl.data_input__input__option}
                        value={ThemeValues.DARK}>
                        {t('components.personalization-settings.dark-theme-value')}
                    </option>
                </CustomSelect>
            </div>
            <div className={`${cl.normal_sep_line__cont}`}>
                <div className={`${cl.normal_sep_line}`} />
            </div>
        </div>
    );
});

PersonalizationSettings.displayName = 'PersonalizationSettings';

export default PersonalizationSettings;
