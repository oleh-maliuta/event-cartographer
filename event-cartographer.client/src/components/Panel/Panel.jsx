import { useRef, memo } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';
import { useHeightCrampState } from "../../hooks/useHeightCrampState";

const Panel = memo(({
    title,
    onSubmit,
    children
}) => {

    const panelRef = useRef(null);

    const { theme } = useTheme();
    const isCramped = useHeightCrampState(panelRef);

    return (
        <div className={`${cl.panel__background} ${cl[theme]}`}>
            <form className={`${cl.panel} ${isCramped ? cl.fixed : ''}`}
                ref={panelRef}
                onSubmit={onSubmit}>
                <div className={cl.panel__header}>
                    <h1 className={cl.panel__header__text}>{title}</h1>
                    <div className={cl.panel__header__line} />
                </div>
                {children}
            </form>
        </div>
    );
});

Panel.displayName = "Panel";

Panel.propTypes = {
    title: PropTypes.string.isRequired,
    onSubmit: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

export default Panel;
