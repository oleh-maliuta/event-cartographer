import React from 'react';
import cl from './.module.css';
import { useTranslation } from 'react-i18next';

const PersonalizationSettings = React.memo(() => {
    const { t, i18n } = useTranslation();

    const [theme] = React.useState(localStorage.getItem('theme') ??
        window.matchMedia("(prefers-color-scheme: light)").matches ? 'light' : 'dark');

    const languageInputRef = React.useRef(null);

    return (
        <div className={`${cl.personalization} ${cl[theme]}`}>
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
                        ref={languageInputRef}
                        onChange={(e) => {
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
            </div>
            <button className={cl.save_changes_button}
                onClick={() => {
                    localStorage.setItem('language', languageInputRef.current.value);
                    alert(t('settings.personalization.changes-are-saved'));
                }}>
                {t('settings.personalization.save-changes')}
            </button>
            <div className={`${cl.normal_sep_line__cont}`}>
                <div className={`${cl.normal_sep_line}`} />
            </div>
        </div>
    );
});

PersonalizationSettings.displayName = 'PersonalizationSettings';

export default PersonalizationSettings;
