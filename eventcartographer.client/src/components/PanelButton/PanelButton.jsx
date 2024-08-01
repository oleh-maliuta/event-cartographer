import React from "react";
import cl from './.module.css';
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";

const PanelButton = React.memo(({
    style,
    text,
    loading,
    onClick
}) => {
    return (
        <button className={cl.main}
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

export default PanelButton;
