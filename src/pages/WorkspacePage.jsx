import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkspacePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if(token == null || token == undefined) {
            navigate("/login");
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    }

    return(
        <div>
            <h1>Welcome!</h1>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default WorkspacePage;