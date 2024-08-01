import React from "react";
import cl from './.module.css';
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

export default Panel;
