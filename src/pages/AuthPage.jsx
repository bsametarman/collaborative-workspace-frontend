import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AuthPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const token = await loginUser(username, password);
            localStorage.setItem("jwt", token);
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Login failed. Check credentials.");
        }
    }
    
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const message = await registerUser(username, password);
            alert(message);
        } catch (error) {
            console.error(error);
            alert("Registration failed.");
        }
    }

    const handleSubmit = (e) => {
        if (isLogin) {
            handleLogin(e);
        } else {
            handleRegister(e);
        }
    };

    return(
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">
                    {isLogin ? 'Welcome' : 'Create an Account'}
                </h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            className="auth-input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="auth-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-toggle">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;