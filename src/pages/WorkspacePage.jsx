import { Stomp } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { getInitialDocument } from '../services/shapshotService';
import './Workspace.css';
import { shareDocument } from '../services/documentService';

const WorkspacePage = () => {
    const navigate = useNavigate();
    const [documentText, setDocumentText] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [position, setPosition] = useState(0);
    const { documentId } = useParams();
    const token = localStorage.getItem("jwt");
    let realUserId = null;
    const [shareUserId, setShareUserId] = useState("");
    
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            realUserId = payload.userId;
        } catch (error) {
            console.error("Failed to decode JWT:", error);
        }
    }

    const myUserId = useRef(realUserId).current;

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
                console.warn(myUserId);
                console.warn(documentId);
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

    const handleShare = async () => {
        if (!shareUserId.trim()) return;
        try {
            shareDocument(documentId, shareUserId, token);            
            alert("Success! Your friend can now join this document.");
            setShareUserId("");
        } catch (error) {
            console.error("Share failed:", error);
            alert(error.response?.data || "Failed to share document.");
        }
    };

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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Paste Friend's UUID..." 
                        value={shareUserId}
                        onChange={(e) => setShareUserId(e.target.value)}
                        style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '250px' }}
                    />
                    <button 
                        onClick={handleShare}
                        style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        Share
                    </button>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
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