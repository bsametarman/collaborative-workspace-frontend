import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDocument, deleteDocument, myDocuments } from '../services/documentService';
import './Dashboard.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        
        if (!token) {
            navigate("/login");
            return;
        }
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserId(payload.userId);
        } catch (error) {
            console.error("Failed to decode JWT:", error);
        }

        const fetchDocuments = async () => {
            try {
                const response = await myDocuments(token);
                setDocuments(response);
            } catch (error) {
                console.error("Failed to load documents", error);
            }
        };

        fetchDocuments();
    }, [navigate]);

    const handleCreateDocument = async () => {
        const token = localStorage.getItem("jwt");
        try {
            const response = await createDocument(token);
            const newDocumentId = response;
            navigate(`/workspace/${newDocumentId}`);
        } catch (error) {
            console.error("Failed to create document", error);
            alert("Could not create document.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    };

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
            return;
        }
        const token = localStorage.getItem("jwt");
        try {
            deleteDocument(token, documentId);
            
            setDocuments(prevDocs => prevDocs.filter(doc => doc.documentId !== documentId));
        } catch (error) {
            console.error("Failed to delete document", error);
            alert(error.response?.data || "Could not delete document.");
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Collaborative Workspace</h2>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <div className="dashboard-content">
                <button className="create-btn" onClick={handleCreateDocument}>
                    + Create New Document
                </button>

                <h2>Your Documents</h2>
                <h3>Your id: {userId}</h3>
                
                {documents.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>You do not have any documents. Create one to start!</p>
                ) : (
                    <ul className="document-grid">
                        {documents.map((doc) => (
                            <li key={doc.id} className="document-card">
                                <div className="document-info">
                                    <p><strong>Document ID:</strong><br/>{doc.documentId}</p>
                                    <p><strong>Your Role:</strong> {doc.role}</p>
                                </div>
                                
                                <div className="card-actions">
                                    <button 
                                        className="open-btn"
                                        onClick={() => navigate(`/workspace/${doc.documentId}`)}>
                                        Open
                                    </button>
                                    
                                    {doc.role === 'OWNER' && (
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteDocument(doc.documentId)}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;