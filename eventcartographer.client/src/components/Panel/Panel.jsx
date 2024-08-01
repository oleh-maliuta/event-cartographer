import React from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import useRefDimensions from "../../hooks/useRefDimensions";

const Panel = React.memo(({
    title,
    children
}) => {
    const panelRef = React.useRef(null);

    const panelDimensions = useRefDimensions(panelRef);

    return (
        <div className={cl.main}>
            <div className={`${cl.panel} ${panelDimensions.height > window.innerHeight ? cl.fixed : ''}`} ref={panelRef}>
                <div className={cl.panel_header}>
                    <h1 className={cl.panel_header_text}>{title}</h1>
                    <div className={cl.panel_header_line} />
                </div>
                {children}
            </div>
        </div>
    );
});

Panel.displayName = "Panel";

Panel.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

export default Panel;
