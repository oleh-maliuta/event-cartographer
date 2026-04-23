import React from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const BlockMessage = React.memo(({
    style,
    state,
    messages
}) => {
    const { theme } = useTheme();

    function renderMessages() {
        const result = [];

        messages?.forEach((el, idx) => {
            result.push(
                <p className={cl.block_message__text}
                    key={idx}>
                    {el}
                </p>
            );
        });

        return result;
    }

    if (messages?.length === 0) {
        return (
            <div className={`${cl.empty}`}
                style={style}>
            </div>
        );
    }

    return (
        <div className={`${cl.block_message} ${cl[state]} ${cl[theme]}`}
            style={style}>
            {renderMessages()}
        </div>
    );
});

BlockMessage.displayName = "BlockMessage";

BlockMessage.propTypes = {
    style: PropTypes.object,
    state: PropTypes.string,
    messages: PropTypes.array
};

export default BlockMessage;
