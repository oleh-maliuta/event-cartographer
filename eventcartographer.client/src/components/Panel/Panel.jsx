import React from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import useRefDimensions from "../../hooks/useRefDimensions";
import { useTheme } from '../../hooks/useTheme';

const Panel = React.memo(({
    title,
    children
}) => {

    const panelRef = React.useRef(null);

    const { theme } = useTheme();
    const panelDimensions = useRefDimensions(panelRef);

    return (
        <div className={`${cl.panel__background} ${cl[theme]}`}>
            <div className={`${cl.panel} ${panelDimensions.height > window.innerHeight ? cl.fixed : ''}`}
                ref={panelRef}>
                <div className={cl.panel__header}>
                    <h1 className={cl.panel__header__text}>{title}</h1>
                    <div className={cl.panel__header__line} />
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
