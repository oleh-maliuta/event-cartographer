import { memo } from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

function renderMessages(messages) {
    return messages?.map((el, idx) => {
        return (
            <p className={cl.block_message__text}
                key={idx}>
                {el}
            </p>
        );
    });
}

const BlockMessage = memo(({
    style,
    state,
}) => {
    const { theme } = useTheme();

    if (state.list?.length === 0) {
        return (
            <div className={`${cl.block_message__empty}`}
                style={style}>
            </div>
        );
    }

    return (
        <div className={`${cl.block_message} ${cl[state.mode]} ${cl[theme]}`}
            style={style}>
            {renderMessages(state.list)}
        </div>
    );
});

BlockMessage.displayName = "BlockMessage";

BlockMessage.propTypes = {
    style: PropTypes.object,
    state: PropTypes.object.isRequired,
};

export default BlockMessage;
