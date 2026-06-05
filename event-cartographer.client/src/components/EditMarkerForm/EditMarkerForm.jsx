import { memo, useCallback, useMemo, useState } from 'react';
import cl from './.module.css';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { useTranslation } from 'react-i18next';
import BlockMessage from '../BlockMessage/BlockMessage';
import { useTheme } from '../../hooks/useTheme';
import PropTypes from 'prop-types';
import { useTimeZone } from '../../hooks/useTimeZone';
import { convertLocalTimeToUtc, convertUtcToLocalTime } from '../../utils/time';
import { MessageStates } from '../../utils/constants';

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

    const apply = useCallback(async () => {
        setLoading(true);

        const url = mode === 'add' ? '/api/markers' : `/api/markers/${marker.id}`;
        const method = mode === 'add' ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method: method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                latitude: Number(marker.latitude) || null,
                longitude: Number(marker.longitude) || null,
                startsAt: marker.startsAt || null,
                importance: marker.importance || null,
                title: marker.title || null,
                description: marker.description || null
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
    }, [dispatchMessageState, marker, mode, onSuccess, setMarker, setMode, t]);

    if (!mode) {
        return null;
    }

    return (
        <form className={`${cl.edit_marker_form} ${cl[theme]}`}
            onSubmit={async (e) => {
                e.preventDefault();
                if (loading) return;
                await apply();
            }}>
            <div className={`${cl.edit_marker_form__field} ${cl.edit_marker_form__latitude}`}>
                <p className={`${cl.edit_marker_form__field_label} ${cl.edit_marker_form__latitude_label}`}>
                    {t('home.marker-edit-latitude-label')}
                </p>
                <input
                    className={`${cl.edit_marker_form__field_input} ${cl.edit_marker_form__latitude_input}`}
                    type='number'
                    value={marker?.latitude ?? ''}
                    required
                    onChange={(e) => setMarker(p => ({ ...p, latitude: e.target.value }))} />
            </div>
            <div className={`${cl.edit_marker_form__field} ${cl.edit_marker_form__longitude}`}>
                <p className={`${cl.edit_marker_form__field_label} ${cl.edit_marker_form__longitude_label}`}>
                    {t('home.marker-edit-longitude-label')}
                </p>
                <input
                    className={`${cl.edit_marker_form__field_input} ${cl.edit_marker_form__longitude_input}`}
                    type='number'
                    value={marker?.longitude ?? ''}
                    required
                    onChange={(e) => setMarker(p => ({ ...p, longitude: e.target.value }))} />
            </div>
            <div className={`${cl.edit_marker_form__field} ${cl.edit_marker_form__starts_at}`}>
                <p className={`${cl.edit_marker_form__field_label} ${cl.edit_marker_form__starts_at_label}`}>
                    {t('home.marker-edit-starts-at-label')}
                </p>
                <input
                    className={`${cl.edit_marker_form__field_input} ${cl.edit_marker_form__starts_at_input}`}
                    type='datetime-local'
                    value={dateTimeLocalValue}
                    step="60"
                    required
                    onChange={(e) => {
                        const utcValue = e.target.value ?
                            convertLocalTimeToUtc(e.target.value, timeZone.name) : null;
                        setMarker(p => ({ ...p, startsAt: utcValue?.toString() }));
                    }} />
            </div>
            <div className={`${cl.edit_marker_form__field} ${cl.edit_marker_form__importance}`}>
                <p className={`${cl.edit_marker_form__field_label} ${cl.edit_marker_form__importance_label}`}>
                    {t('home.marker-edit-importance-label')}
                </p>
                <select
                    className={`${cl.edit_marker_form__field_input} ${cl.edit_marker_form__importance_input}`}
                    value={marker?.importance ?? ''}
                    required
                    onChange={(e) => setMarker(p => ({ ...p, importance: e.target.value }))}>
                    <option className={cl.edit_marker_form__importance_input__no_value} value=''>
                        {t('home.no-importance-value')}
                    </option>
                    <option className={cl.edit_marker_form__importance_input__high_value} value='high'>
                        {t('home.high-importance-value')}
                    </option>
                    <option className={cl.edit_marker_form__importance_input__medium_value} value='medium'>
                        {t('home.medium-importance-value')}
                    </option>
                    <option className={cl.edit_marker_form__importance_input__low_value} value='low'>
                        {t('home.low-importance-value')}
                    </option>
                </select>
            </div>
            <div className={`${cl.edit_marker_form__field} ${cl.edit_marker_form__title}`}>
                <p className={`${cl.edit_marker_form__field_label} ${cl.edit_marker_form__title_label}`}>
                    {t('home.marker-edit-title-label')}
                </p>
                <input
                    className={`${cl.edit_marker_form__field_input} ${cl.edit_marker_form__title_input}`}
                    type='text'
                    maxLength='100'
                    value={marker?.title ?? ''}
                    required
                    onChange={(e) => setMarker(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className={`${cl.edit_marker_form__field} ${cl.edit_marker_form__description}`}>
                <p className={`${cl.edit_marker_form__field_label} ${cl.edit_marker_form__description_label}`}>
                    {t('home.marker-edit-description-label')}
                </p>
                <textarea
                    className={`${cl.edit_marker_form__field_input} ${cl.edit_marker_form__description_input}`}
                    maxLength='5000'
                    value={marker?.description ?? ''}
                    onChange={(e) => setMarker(p => ({ ...p, description: e.target.value }))}
                ></textarea>
            </div>
            <BlockMessage
                style={{ marginTop: '8px', width: 'calc(100% - 22px)' }}
                state={messageState} />
            {
                mode === 'add' ?
                    <div className={`${cl.edit_marker_form__buttons}`}>
                        <button className={`${cl.edit_marker_form__button} ${cl.edit_marker_form__cancel_button}`}
                            type="button"
                            onClick={() => {
                                setMarker(null);
                                setMode('list');
                                dispatchMessageState({ type: 'CLEAR_MESSAGES' });
                            }}>
                            {t('home.cancel-marker-editing')}
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
                                        {t('home.add-marker')}
                                    </span>
                            }
                        </button>
                    </div>
                    :
                    <div className={`${cl.edit_marker_form__buttons}`}>
                        <button className={`${cl.edit_marker_form__button} ${cl.edit_marker_form__cancel_button}`}
                            type="button"
                            onClick={() => {
                                setMarker(null);
                                setMode('list');
                                dispatchMessageState({ type: 'CLEAR_MESSAGES' });
                            }}>
                            {t('home.cancel-marker-editing')}
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
                                        {t('home.edit-marker')}
                                    </span>
                            }
                        </button>
                    </div>
            }
        </form>
    );
});

EditMarkerForm.displayName = 'EditMarkerForm';

LoadingAnimation.propTypes = {
    mode: PropTypes.string.isRequired,
    setMode: PropTypes.func.isRequired,
    marker: PropTypes.object.isRequired,
    setMarker: PropTypes.func.isRequired,
    messageState: PropTypes.object.isRequired,
    dispatchMessageState: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

export default EditMarkerForm;
