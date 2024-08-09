import React from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";

const PanelButton = React.memo(({
    style,
    text,
    loading,
    onClick
}) => {
    return (
        <button className={cl.panel_button}
            style={style}
            onClick={() => {
                if (!loading) {
                    onClick();
                }
            }}>
            {
                loading ?
                    <LoadingAnimation
                        curveColor1="#FFFFFF"
                        curveColor2="#00000000"
                        size="20px"
                        curveWidth="3px" />
                    :
                    <span>{text}</span>
            }
        </button>
    );
});

PanelButton.displayName = 'PanelButton';

PanelButton.propTypes = {
    style: PropTypes.object,
    text: PropTypes.string,
    loading: PropTypes.bool,
    onClick: PropTypes.func
};

export default PanelButton;
