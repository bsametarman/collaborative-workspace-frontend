import { Stomp } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { getInitialDocument } from '../services/shapshotService';
import './Workspace.css';

const WorkspacePage = () => {
    const navigate = useNavigate();
    const [documentText, setDocumentText] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [position, setPosition] = useState(0);
    const { documentId } = useParams();
    const myUserId = useRef(crypto.randomUUID()).current;

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if(token == null || token == undefined) {
            navigate("/login");
            return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };

        const fetchInitialDocument = async () => {
            try {
                const response = await getInitialDocument(documentId);
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

            client.subscribe(`/topic/document/${documentId}`, (message) => {
                const edit = JSON.parse(message.body);

                if (edit.userId === myUserId) {
                    return; 
                }

                if (edit.actionType === 'INSERT') {
                    setDocumentText(prev => prev.slice(0, edit.position) + edit.content + prev.slice(edit.position));
                }
                else if (edit.actionType === 'DELETE') {
                    setDocumentText(prev => prev.slice(0, edit.position) + prev.slice(edit.position + 1));
                }
            });
        });

        return () => {
            if(client) {
                client.disconnect();
            }
        };

    }, [navigate, documentId, myUserId]);

    const handleTyping = (e) => {
        const newText = e.target.value;
        const cursorPos = e.target.selectionStart;

        if (newText.length > documentText.length) {
            const insertedChar = newText.slice(cursorPos - 1, cursorPos);
            
            if (stompClient) {
                const payload = {
                    userId: myUserId,
                    documentId: documentId,
                    content: insertedChar,
                    position: cursorPos - 1,
                    actionType: 'INSERT'
                };
                stompClient.send(`/app/document/edit/${documentId}`, {}, JSON.stringify(payload));
            }
        }
        else if (newText.length < documentText.length) {
            const charsDeleted = documentText.length - newText.length;
            const deletePosition = cursorPos; 
            
            if (stompClient) {
                for (let i = 0; i < charsDeleted; i++) {
                    const payload = {
                        userId: myUserId,
                        documentId: 1,
                        content: "",
                        position: deletePosition, 
                        actionType: 'DELETE'
                    };
                    stompClient.send(`/app/document/edit/${documentId}`, {}, JSON.stringify(payload));
                }
            }
        }

        setDocumentText(newText);
    };

    const logout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    }

    return(
        <div className="workspace-container">
            <header className="workspace-header">
                <h2>Collaborative Workspace</h2>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </header>
            
            <main className="editor-wrapper">
                <textarea 
                    className="document-paper"
                    value={documentText}
                    onChange={handleTyping}
                    placeholder="Start typing your document..."
                />
            </main>
        </div>
    );
}

export default WorkspacePage;