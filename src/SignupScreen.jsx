import React, { useRef } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import './SignupScreen.css';

function SignupScreen() {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const register = (e) => {
        e.preventDefault();
        createUserWithEmailAndPassword(
            auth,
            emailRef.current.value,
            passwordRef.current.value
        ).catch((error) => {
            alert(error.message);
        });
    };

    const signIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(
            auth,
            emailRef.current.value,
            passwordRef.current.value
        ).catch((error) => {
            // If sign in fails, try to automatically register them
            createUserWithEmailAndPassword(
                auth,
                emailRef.current.value,
                passwordRef.current.value
            ).catch((err) => {
                if (err.code === "auth/email-already-in-use") {
                    alert("This email is already registered, but you typed the WRONG PASSWORD. Please try again.");
                } else if (err.code === "auth/weak-password") {
                    alert("Password is too short! It must be at least 6 characters.");
                } else {
                    alert(err.message);
                }
            });
        });
    };

    return (
        <div className="signupScreen">
            <form>
                <h1>Sign In</h1>
                <input ref={emailRef} placeholder="Email address" type="email" />
                <input ref={passwordRef} placeholder="Password" type="password" />
                <button type="submit" onClick={signIn}>Sign In (or Sign Up)</button>
                <h4>
                    <span className="signupScreen_gray">New to Netflix? </span>
                    <span className="signupScreen_link" onClick={register}>Sign up now.</span>
                </h4>
            </form>
        </div>
    );
}

export default SignupScreen;
