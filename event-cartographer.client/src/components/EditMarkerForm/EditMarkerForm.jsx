import { memo, useCallback, useMemo, useState } from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import PropTypes from 'prop-types';
import { useTimeZone } from '../../hooks/useTimeZone';
import { convertLocalTimeToUtc, convertUtcToLocalTime } from '../../utils/time';
import { MessageStates, CustomElementAppearanceModes } from '../../utils/constants';
import CustomInput from '../CustomInput/CustomInput';
import CustomSelect from '../CustomSelect/CustomSelect';
import CustomTextarea from '../CustomTextarea/CustomTextarea';

const blockMessageStyle = { marginTop: '8px', width: 'calc(100% - 22px)' };
const formFieldStyle = { marginTop: '15px' };
const textareaStyle = { height: '150px' };

const EditMarkerForm = memo(({
    mode,
    setMode,
    marker,
    setMarker,
    messageState,
    dispatchMessageState,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const { theme } = useTheme();
    const { timeZone } = useTimeZone();

    const dateTimeLocalValue = useMemo(() => {
        return marker?.startsAt ? convertUtcToLocalTime(marker.startsAt, timeZone.name).toString() : '';
    }, [marker?.startsAt, timeZone.name]);

    const onCancel = useCallback(() => {
        setMarker(null);
        setMode('list');
        dispatchMessageState({ type: 'CLEAR_MESSAGES' });
    }, [dispatchMessageState, setMarker, setMode]);

    const onChangeLatitudeEvent = useCallback(
        (e) => setMarker(p => ({ ...p, latitude: e.target.value })),
        [setMarker]);

    const onChangeLongitudeEvent = useCallback(
        (e) => setMarker(p => ({ ...p, longitude: e.target.value })),
        [setMarker]);

    const onChangeStartsAtEvent = useCallback((e) => {
        const utcValue = e.target.value ?
            convertLocalTimeToUtc(e.target.value, timeZone.name) : null;
        setMarker(p => ({ ...p, startsAt: utcValue?.toString() }));
    }, [setMarker, timeZone.name]);

    const onChangeImportanceEvent = useCallback(
        (e) => setMarker(p => ({ ...p, importance: e.target.value })),
        [setMarker]);

    const onChangeTitleEvent = useCallback(
        (e) => setMarker(p => ({ ...p, title: e.target.value })),
        [setMarker]);

    const onChangeDescriptionEvent = useCallback(
        (e) => setMarker(p => ({ ...p, description: e.target.value })),
        [setMarker]);

    const apply = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const url = mode === 'add' ? '/api/markers' : `/api/markers/${formData.get('id')}`;
        const method = mode === 'add' ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method: method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                latitude: Number(formData.get('latitude')),
                longitude: Number(formData.get('longitude')),
                startsAt: formData.get('startsAt'),
                importance: formData.get('importance'),
                title: formData.get('title'),
                description: formData.get('description')
            })
        });

        const json = await response.json();

        if (response.ok) {
            setMode('list');
            setMarker(null);
            dispatchMessageState({ type: 'CLEAR_MESSAGES' });
            onSuccess && onSuccess();
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
                        errors.push(t(json.errors[prop][err]));
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

        setLoading(false);
    }, [dispatchMessageState, mode, onSuccess, setMarker, setMode, t]);

    if (!mode)
        return null;

    return (
        <form className={`${cl.edit_marker_form} ${cl[theme]}`}
            onSubmit={apply}>
            <CustomInput
                id='editMarkerForm-id-input'
                name='id'
                type='hidden'
                value={marker?.id ?? ''} />
            <CustomInput
                containerStyle={formFieldStyle}
                appearanceMode={CustomElementAppearanceModes.SIMPLE}
                id='editMarkerForm-latitude-input'
                name='latitude'
                label={t('components.edit-marker-form.latitude-label')}
                type='number'
                autoComplete='off'
                max='90'
                min='-90'
                step='any'
                required
                value={marker?.latitude ?? ''}
                valueMissingValidity={t('components.edit-marker-form.latitude_invalid.value_missing')}
                rangeUnderflowValidity={t('components.edit-marker-form.latitude_invalid.range_underflow')}
                rangeOverflowValidity={t('components.edit-marker-form.latitude_invalid.range_overflow')}
                onChange={onChangeLatitudeEvent} />
            <CustomInput
                containerStyle={formFieldStyle}
                appearanceMode={CustomElementAppearanceModes.SIMPLE}
                id='editMarkerForm-longitude-input'
                name='longitude'
                label={t('components.edit-marker-form.longitude-label')}
                type='number'
                autoComplete='off'
                max='180'
                min='-180'
                step='any'
                required
                value={marker?.longitude ?? ''}
                valueMissingValidity={t('components.edit-marker-form.longitude_invalid.value_missing')}
                rangeUnderflowValidity={t('components.edit-marker-form.longitude_invalid.range_underflow')}
                rangeOverflowValidity={t('components.edit-marker-form.longitude_invalid.range_overflow')}
                onChange={onChangeLongitudeEvent} />
            <CustomInput
                containerStyle={formFieldStyle}
                appearanceMode={CustomElementAppearanceModes.SIMPLE}
                id='editMarkerForm-startsAt-input'
                name='startsAt'
                label={t('components.edit-marker-form.starts-at-label')}
                type='datetime-local'
                autoComplete='off'
                step='60'
                required
                value={dateTimeLocalValue}
                valueMissingValidity={t('components.edit-marker-form.starts_at_invalid.value_missing')}
                onChange={onChangeStartsAtEvent} />
            <CustomSelect
                containerStyle={formFieldStyle}
                appearanceMode={CustomElementAppearanceModes.SIMPLE}
                id='editMarkerForm-importance-select'
                name='importance'
                value={marker?.importance ?? ''}
                label={t('components.edit-marker-form.importance-label')}
                required
                valueMissingValidity={t('components.edit-marker-form.importance_invalid.value_missing')}
                onChange={onChangeImportanceEvent}>
                <option className={cl.edit_marker_form__importance_input__no_value} value=''>
                    {t('components.edit-marker-form.no-importance-value')}
                </option>
                <option className={cl.edit_marker_form__importance_input__high_value} value='high'>
                    {t('components.edit-marker-form.high-importance-value')}
                </option>
                <option className={cl.edit_marker_form__importance_input__medium_value} value='medium'>
                    {t('components.edit-marker-form.medium-importance-value')}
                </option>
                <option className={cl.edit_marker_form__importance_input__low_value} value='low'>
                    {t('components.edit-marker-form.low-importance-value')}
                </option>
            </CustomSelect>
            <CustomInput
                containerStyle={formFieldStyle}
                appearanceMode={CustomElementAppearanceModes.SIMPLE}
                id='editMarkerForm-title-input'
                name='title'
                label={t('components.edit-marker-form.title-label')}
                type='text'
                autoComplete='off'
                maxLength='100'
                required
                value={marker?.title ?? ''}
                valueMissingValidity={t('components.edit-marker-form.title_invalid.value_missing')}
                onChange={onChangeTitleEvent} />
            <CustomTextarea
                containerStyle={formFieldStyle}
                textareaStyle={textareaStyle}
                appearanceMode={CustomElementAppearanceModes.SIMPLE}
                autoComplete='off'
                id='editMarkerForm-description-textarea'
                name='description'
                label={t('components.edit-marker-form.description-label')}
                maxLength='5000'
                value={marker?.description ?? ''}
                onChange={onChangeDescriptionEvent} />
            <BlockMessage
                style={blockMessageStyle}
                state={messageState} />
            {
                mode === 'add' ?
                    <div className={`${cl.edit_marker_form__buttons}`}>
                        <button className={`${cl.edit_marker_form__button} ${cl.edit_marker_form__cancel_button}`}
                            type="button"
                            onClick={onCancel}>
                            {t('components.edit-marker-form.cancel-marker-editing')}
                        </button>
                        <button className={`${cl.edit_marker_form__button} ${cl.edit_marker_form__add_button}`}
                            type="submit"
                            disabled={loading}>
                            {
                                loading ?
                                    <LoadingAnimation
                                        curveColor1="#FFFFFF"
                                        curveColor2="#00000000"
                                        size="15px"
                                        curveWidth="3px" />
                                    :
                                    <span>
                                        {t('components.edit-marker-form.add-marker')}
                                    </span>
                            }
                        </button>
                    </div>
                    :
                    <div className={`${cl.edit_marker_form__buttons}`}>
                        <button className={`${cl.edit_marker_form__button} ${cl.edit_marker_form__cancel_button}`}
                            type="button"
                            onClick={onCancel}>
                            {t('components.edit-marker-form.cancel-marker-editing')}
                        </button>
                        <button className={`${cl.edit_marker_form__button} ${cl.edit_marker_form__edit_button}`}
                            type="submit"
                            disabled={loading}>
                            {
                                loading ?
                                    <LoadingAnimation
                                        curveColor1="#FFFFFF"
                                        curveColor2="#00000000"
                                        size="15px"
                                        curveWidth="3px" />
                                    :
                                    <span>
                                        {t('components.edit-marker-form.edit-marker')}
                                    </span>
                            }
                        </button>
                    </div>
            }
        </form >
    );
});

EditMarkerForm.displayName = 'EditMarkerForm';

EditMarkerForm.propTypes = {
    mode: PropTypes.string.isRequired,
    setMode: PropTypes.func.isRequired,
    marker: PropTypes.object.isRequired,
    setMarker: PropTypes.func.isRequired,
    messageState: PropTypes.object.isRequired,
    dispatchMessageState: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
};

export default EditMarkerForm;
