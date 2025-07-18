import React from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";
import { useTheme } from "../../providers/ThemeProvider";

const PageNavigator = React.memo(({
    currentPage,
    pageCount,
    loadData
}) => {
    const { theme } = useTheme();

    function renderPageList() {
        if (pageCount <= 1) {
            return;
        }

        const loadPage = (specifiedPage) => {
            if (specifiedPage !== currentPage) {
                loadData(specifiedPage);
            }
        };

        let result = [];
        let left = [];
        let right = [];
        let start, end;

        if (currentPage > 1) {
            left.push(
                <span className={cl.page_navigator__obj} key="arrow-left"
                    onClick={() => loadPage(currentPage - 1)}>&#60;</span>
            );

            if ((currentPage - 4) > 1) {
                left.push(
                    <span className={`${cl.page_navigator__obj}`} key="1" onClick={() => loadPage(1)}>1</span>
                );

                left.push(
                    <span className={`${cl.page_navigator__obj}`} key="dots-left"
                        onClick={() => {
                            const idxLink = (currentPage - 10) > 1
                                ? currentPage - 10
                                : 2;

                            loadPage(idxLink);
                        }}>...</span>
                );

                start = currentPage - 2;
            }
            else {
                start = 1;
            }
        }
        else {
            start = 1;
        }

        if (currentPage < pageCount) {
            right.unshift(
                <span className={cl.page_navigator__obj} key="arrow-right"
                    onClick={() => loadPage(currentPage + 1)}>&#62;</span>
            );

            if ((currentPage + 4) < pageCount) {
                right.unshift(
                    <span className={`${cl.page_navigator__obj}`} key={pageCount}
                        onClick={() => loadPage(pageCount)}>{pageCount}</span>
                );

                right.unshift(
                    <span className={`${cl.page_navigator__obj}`} key="dots-right"
                        onClick={() => {
                            const idxLink = (currentPage + 10) < pageCount
                                ? currentPage + 10
                                : pageCount - 1;

                            loadPage(idxLink);
                        }}>...</span>
                );

                end = currentPage + 2;
            }
            else {
                end = pageCount;
            }
        }
        else {
            end = pageCount;
        }

        if ((end - start) < 4) {
            while ((end - start) < 4 && end < pageCount) {
                end++;
            }
        }

        if ((end - start) < 4) {
            while ((end - start) < 4 && start > 1) {
                start--;
            }
        }

        for (let i = start; i <= end; i++) {
            result.push(
                <span
                    className={`${cl.page_navigator__obj} ${currentPage === i ? cl.current : ''}`}
                    key={i}
                    onClick={() => loadPage(i)}>{i}</span>
            );
        }

        result.unshift(left);
        result.push(right);

        return result;
    }

    return (
        <div className={`${cl.page_navigator__cont} ${cl[theme]}`}>
            <div className={cl.page_navigator}>
                {renderPageList()}
            </div>
        </div>
    );
});

PageNavigator.displayName = 'PageNavigator';

PageNavigator.propTypes = {
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    loadData: PropTypes.func.isRequired
};

export default PageNavigator;
