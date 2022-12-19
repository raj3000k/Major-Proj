import React, { useState } from 'react';
import Env from '../config/env.config';
import { strings as commonStrings } from '../lang/common';
import { strings } from '../lang/sign-up';
import * as UserService from '../services/UserService';
import Master from '../elements/Master';
import ReCAPTCHA from 'react-google-recaptcha';
import Error from '../elements/Error';
import Backdrop from '../elements/SimpleBackdrop';
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper
} from '@mui/material';
import validator from 'validator';
import * as Helper from '../common/Helper';

import '../assets/css/signup.css';

const SignUp = () => {
    const [language, setLanguage] = useState(Env.DEFAULT_LANGUAGE);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [reCaptchaToken, setReCaptchaToken] = useState('');
    const [error, setError] = useState(false);
    const [recaptchaError, setRecaptchaError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(true);

    const handleOnChangeFullName = (e) => {
        setFullName(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (!e.target.value) {
            setEmailError(false);
            setEmailValid(true);
        }
    };

    const handleOnChangePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleOnChangeConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
    };

    const validateEmail = async (email) => {
        if (email) {
            if (validator.isEmail(email)) {
                try {
                    const status = await UserService.validateEmail({ email });
                    if (status === 200) {
                        setEmailError(false);
                        setEmailValid(true);
                        return true;
                    } else {
                        setEmailError(true);
                        setEmailValid(true);
                        setError(false);
                        return false;
                    }
                } catch (err) {
                    Helper.error(err);
                    setEmailError(false);
                    setEmailValid(true);
                    return false;
                }
            } else {
                setEmailError(false);
                setEmailValid(false);
                return false;
            }
        } else {
            setEmailError(false);
            setEmailValid(true);
            return false;
        }
    };

    const handleOnBlur = async (e) => {
        await validateEmail(e.target.value);
    };

    const handleOnRecaptchaVerify = (token) => {
        setReCaptchaToken(token);
        setRecaptchaError(!token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailValid = await validateEmail(email);
        if (!emailValid) {
            return;
        }

        if (password.length < 6) {
            setPasswordError(true);
            setRecaptchaError(false);
            setPasswordsDontMatch(false);
            setError(false);
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError(false);
            setRecaptchaError(false);
            setPasswordsDontMatch(true);
            setError(false);
            return;
        }

        if (!reCaptchaToken) {
            setPasswordError(false);
            setRecaptchaError(true);
            setPasswordsDontMatch(false);
            setError(false);
            return;
        }

        setLoading(true);

        const data = {
            email: email,
            password: password,
            fullName: fullName,
            language: UserService.getLanguage()
        };

        UserService.signup(data)
            .then(status => {
                if (status === 200) {
                    UserService.signin({ email: email, password: password })
                        .then(signInResult => {
                            if (signInResult.status === 200) {
                                window.location.href = '/' + window.location.search;
                            } else {
                                setPasswordError(false);
                                setRecaptchaError(false);
                                setPasswordsDontMatch(false);
                                setError(true);
                            }
                        }).catch(err => {
                            setPasswordError(false);
                            setRecaptchaError(false);
                            setPasswordsDontMatch(false);
                            setError(true);
                        });
                } else
                    setPasswordError(false);
                setRecaptchaError(false);
                setPasswordsDontMatch(false);
                setError(true);
            })
            .catch(err => {
                setPasswordError(false);
                setRecaptchaError(false);
                setPasswordsDontMatch(false);
                setError(true);
            });
    };

    const onLoad = (user) => {
        if (user) {
            window.location.href = '/';
        } else {
            setLanguage(UserService.getLanguage());
            setVisible(true);
        }
    };

    return (
        <Master strict={false} onLoad={onLoad}>
            <div className="signup">
                <Paper className="signup-form" elevation={10} style={visible ? null : { display: 'none' }}>
                    <h1 className="signup-form-title"> {strings.SIGN_UP_HEADING} </h1>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <FormControl fullWidth margin="dense">
                                <InputLabel htmlFor="full-name">{commonStrings.FULL_NAME}</InputLabel>
                                <Input
                                    id="full-name"
                                    type="text"
                                    name="FullName"
                                    required
                                    onChange={handleOnChangeFullName}
                                    autoComplete="off"
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel htmlFor="email">{commonStrings.EMAIL}</InputLabel>
                                <Input
                                    id="email"
                                    type="text"
                                    error={!emailValid || emailError}
                                    name="Email"
                                    onBlur={handleOnBlur}
                                    onChange={handleEmailChange}
                                    required
                                    autoComplete="off"
                                />
                                <FormHelperText error={!emailValid || emailError}>
                                    {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                                    {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
                                </FormHelperText>
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel htmlFor="password">{commonStrings.PASSWORD}</InputLabel>
                                <Input
                                    id="password"
                                    name="Password"
                                    onChange={handleOnChangePassword}
                                    required
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        form: {
                                            autoComplete: 'off',
                                        },
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel htmlFor="confirm-password">{commonStrings.CONFIRM_PASSWORD}</InputLabel>
                                <Input
                                    id="confirm-password"
                                    name="ConfirmPassword"
                                    onChange={handleOnChangeConfirmPassword}
                                    autoComplete="password"
                                    required
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        form: {
                                            autoComplete: 'off',
                                        },
                                    }}
                                />
                            </FormControl>
                            <div className="recaptcha">
                                <ReCAPTCHA
                                    sitekey={Env.RECAPTCHA_SITE_KEY}
                                    hl={language}
                                    onChange={handleOnRecaptchaVerify}
                                />
                            </div>
                            <div className="buttons">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className='btn-primary btn-margin-bottom'
                                    size="small"
                                >
                                    {strings.SIGN_UP}
                                </Button>
                                <Button
                                    variant="contained"
                                    className='btn-secondary btn-margin-bottom'
                                    size="small"
                                    href="/"> {commonStrings.CANCEL}
                                </Button>
                            </div>
                        </div>
                        <div className="form-error">
                            {passwordError && <Error message={commonStrings.PASSWORD_ERROR} />}
                            {passwordsDontMatch && <Error message={commonStrings.PASSWORDS_DONT_MATCH} />}
                            {recaptchaError && <Error message={strings.RECAPTCHA_ERROR} />}
                            {error && <Error message={strings.SIGN_UP_ERROR} />}
                        </div>
                    </form>
                </Paper>
            </div>
            {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
        </Master>
    );
};

export default SignUp;