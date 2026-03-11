import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const token = await loginUser(username, password);
            localStorage.setItem("jwt", token);
            navigate("/workspace");
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

    return(
        <div>
            <form>
                <label>Username</label>
                <input type='text' id='username' onChange={(e) => setUsername(e.target.value)}></input>
                <label>Password</label>
                <input type='password' id='password' onChange={(e) => setPassword(e.target.value)}></input>
            </form>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default AuthPage;