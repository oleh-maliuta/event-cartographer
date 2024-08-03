import React from 'react';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import { useSearchParams } from 'react-router-dom';
import PanelInput from '../../components/PanelInput/PanelInput';
import PanelButton from '../../components/PanelButton/PanelButton';
import Panel from '../../components/Panel/Panel';

const ResetPasswordLayout = () => {
    const [searchParams] = useSearchParams();

    const [submitting, setSubmitting] = React.useState(false);

    const passwordInputRef = React.useRef(null);
    const confirmPasswordInputRef = React.useRef(null);

    const passwordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '35px' };
    }, []);
    const confirmPasswordInfoInputStyle = React.useMemo(() => {
        return { marginTop: '20px' };
    }, []);
    const submitButtonStyle = React.useMemo(() => {
        return { marginTop: '35px' };
    }, []);

    const resetPasswordRequest = React.useCallback(async () => {
        setSubmitting(true);

        const response = await fetch(`${HOST}:${API_PORT}/api/users/reset-password`, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: searchParams.get('user') || null,
                token: searchParams.get('token') || null,
                newPassword: passwordInputRef.current.value || null,
                confirmNewPassword: confirmPasswordInputRef.current.value || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            alert("Password is reset.");
            window.location.replace(`${HOST}:${CLIENT_PORT}/sign-in`);
        } else if (!response.ok) {
            if (json.message) {
                alert(json.message);
            } else {
                let errors = "";
                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors += `${json.errors[prop][err]}\n`;
                    }
                }
                errors = errors.slice(0, -1);
                alert(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            alert("Server error.");
        }

        setSubmitting(false);
    }, [searchParams]);

    const windowKeyPressEvent = React.useCallback((e) => {
        switch (e.key) {
            case "Enter":
                resetPasswordRequest();
                break;
            default:
                return;
        }
    }, [resetPasswordRequest]);

    React.useEffect(() => {
        window.addEventListener("keypress", windowKeyPressEvent);

        return () => {
            window.removeEventListener("keypress", windowKeyPressEvent);
        };
    }, [windowKeyPressEvent]);

    return (
        <Panel
            title='Reset password'>
            <PanelInput
                containerStyle={passwordInfoInputStyle}
                label='Password'
                type='password'
                placeholder='Password'
                maxLength='200'
                ref={passwordInputRef} />
            <PanelInput
                containerStyle={confirmPasswordInfoInputStyle}
                label='Confirm password'
                type='password'
                placeholder='Confirm password'
                maxLength='200'
                ref={confirmPasswordInputRef} />
            <PanelButton
                style={submitButtonStyle}
                text='Submit'
                loading={submitting}
                onClick={resetPasswordRequest} />
        </Panel>
    );
}

export default ResetPasswordLayout;
