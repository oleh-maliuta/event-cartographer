import React from 'react';
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

const YesNoDialog = React.memo(({
    dialogState,
    title,
    description,
    onYesButtonClick,
    onNoButtonClick
}) => {
    const { t } = useTranslation();

    const [processing, setProcessing] = React.useState(false);

    const dialogRef = React.useRef(null);

    const { theme } = useTheme();

    async function yesButtonClick() {
        setProcessing(true);
        await Promise.resolve(onYesButtonClick());
        setProcessing(false);
    }

    async function noButtonClick() {
        setProcessing(true);
        await Promise.resolve(onNoButtonClick());
        setProcessing(false);
    }

    React.useEffect(() => {
        if (dialogState) {
            dialogRef.current.showModal();
        } else {
            dialogRef.current.close();
        }
    }, [dialogState]);

    return (
        <dialog className={`${cl.yes_no_dialog} ${cl[theme]}`}
            ref={dialogRef}>
            <div className={`${cl.yes_no_dialog__content}`}>
                <h1 className={`${cl.yes_no_dialog__header}`}>
                    {title}
                </h1>
                <p className={`${cl.yes_no_dialog__description}`}>
                    {description}
                </p>
            </div>
            <div className={`${cl.yes_no_dialog__control}`}>
                <div className={`${cl.yes_no_dialog__control__buttons}`}>
                    <button className={`${cl.yes_no_dialog__control__buttons__no}`}
                        disabled={processing}
                        onClick={noButtonClick}>
                        {t('yes-no-dialog.no-button')}
                    </button>
                    <button className={`${cl.yes_no_dialog__control__buttons__yes}`}
                        disabled={processing}
                        onClick={yesButtonClick}>
                        {t('yes-no-dialog.yes-button')}
                    </button>
                </div>
            </div>
        </dialog>
    );
});

YesNoDialog.displayName = "YesNoDialog";

YesNoDialog.propTypes = {
    dialogState: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onYesButtonClick: PropTypes.func.isRequired,
    onNoButtonClick: PropTypes.func.isRequired,
};

export default YesNoDialog;
