import { memo, useEffect, useState } from 'react';
import cl from './.module.css';
import PropTypes from "prop-types";
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../utils/constants';
import { useTheme } from '../../hooks/useTheme';

const MapInterface = memo(({
    isLoading,
    onMarkerMenuToggle,
}) => {
    const [userData, setUserData] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navigate = useNavigate();

    const { theme } = useTheme();

    async function logOutRequest() {
        setIsLoggingOut(true);

        const response = await fetch('/api/auth/logout', {
            method: "GET",
            credentials: "include"
        });

        if (response.ok) {
            navigate(PageRoutes.SIGN_IN);
        }

        setIsLoggingOut(false);
    }

    useEffect(() => {
            const fetchUserData = async () => {
                const response = await fetch('/api/users/self', {
                    method: "GET",
                    credentials: "include"
                });
                const json = await response.json();
                setUserData(json.data || null);
            };
    
            fetchUserData();
        }, []);

    return (
        <div className={`${cl.map_interface} ${cl[theme]}`}>
            <div className={`${cl.map_interface__user_name__cont}`}>
                <span className={`${cl.map_interface__user_name}`}>{userData?.name}</span>
            </div>
            <button className={`${cl.map_interface__marker_menu_button}`}
                type='button'
                onClick={onMarkerMenuToggle}>
                <img className={`${cl.map_interface__marker_menu_button__img}`}
                    alt='marker menu' />
            </button>
            <button className={`${cl.map_interface__settings_button}`}
                type='button'
                onClick={() => navigate(PageRoutes.USER_SETTINGS)}>
                <img className={`${cl.map_interface__settings_button__img}`}
                    alt='settings' />
            </button>
            <button className={cl.map_interface__log_out_button}
                type='button'
                disabled={isLoggingOut}
                onClick={logOutRequest}>
                {
                    isLoggingOut ?
                        <div className={cl.map_interface__log_out_button__loading}>
                            <LoadingAnimation
                                curveColor1="transparent"
                                curveColor2="#000000"
                                size="18px"
                                curveWidth="4px" />
                        </div>
                        : <img className={cl.map_interface__log_out_button__img}
                            alt='log out' />
                }
            </button>
            {
                isLoading ?
                    <div className={cl.map_interface__markers_loading}>
                        <LoadingAnimation
                            curveColor1="#FFFFFF"
                            curveColor2="#000000"
                            size="28px"
                            curveWidth="5px" />
                    </div>
                    : <></>
            }
        </div>
    );
});

MapInterface.displayName = 'MapInterface';

MapInterface.propTypes = {
    isLoading: PropTypes.bool,
    onMarkerMenuToggle: PropTypes.func,
};

export default MapInterface;
