import { Stomp } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { getInitialDocument } from '../services/shapshotService';

const WorkspacePage = () => {
    const navigate = useNavigate();
    const [documentText, setDocumentText] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [letter, setLetter] = useState("");
    const [position, setPosition] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if(token == null || token == undefined) {
            navigate("/login");
            return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };

        const fetchInitialDocument = async () => {
            try {
                const response = await getInitialDocument(1);
                setDocumentText(response);
                setPosition(response.length);
            } catch (error) {
                console.error("Failed to load initial document:", error);
            }
        };

        fetchInitialDocument();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        
        client.connect(headers, (frame) => {
            console.log("Connected to Gateway: ", frame);
            
            setStompClient(client);

            client.subscribe("/topic/document/1", (message) => {
                const edit = JSON.parse(message.body);

                if (edit.actionType === 'INSERT') {
                    setDocumentText((prevText) => {
                        return prevText.slice(0, edit.position) + edit.content + prevText.slice(edit.position);
                    });
                    console.log(documentText);
                }
            });
        });

        return () => {
            if(client) {
                client.disconnect();
            }
        };

    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    }
    
    const sendEdit = () => {
        if (stompClient && letter) {
            const payload = {
                userId: Math.floor(Math.random() * 1000),
                documentId: 1,
                content: letter,
                position: parseInt(position),
                actionType: 'INSERT'
            };

            stompClient.send("/app/document/edit/1", {}, JSON.stringify(payload));
            
            setLetter("");
            setPosition(prev => parseInt(prev) + 1);
        } else {
            alert("WebSocket is not connected yet or letter is empty!");
        }
    };

    return(
        <div>
            <h1>Welcome!</h1>
            <textarea 
                readOnly
                value={documentText} 
                style={{ width: '100%', height: '200px', fontSize: '16px', marginBottom: '10px' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    maxLength="1" 
                    placeholder="Type one letter..." 
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                />
                <input 
                    type="number" 
                    placeholder="Index (e.g. 0)" 
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    style={{ width: '100px' }}
                />
                <button onClick={sendEdit}>Send Keystroke</button>
            </div>
            
            <br />
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default WorkspacePage;