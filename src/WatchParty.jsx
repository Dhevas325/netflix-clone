import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { 
    doc, 
    onSnapshot, 
    setDoc, 
    updateDoc, 
    arrayUnion, 
    getDoc,
    serverTimestamp 
} from "firebase/firestore";
import { useSelector } from 'react-redux';
import { selectUser, selectActiveProfile } from './features/userSlice';
import Player from './Player';
import './WatchParty.css';
import { IoSend, IoCopyOutline, IoPeople, IoClose } from 'react-icons/io5';

function WatchParty() {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(selectUser);
    const profile = useSelector(selectActiveProfile);
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [members, setMembers] = useState([]);
    const [showInvite, setShowInvite] = useState(true);
    
    const chatEndRef = useRef(null);

    // Memoize Room ID to prevent re-generation on re-renders
    const roomId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const existingRoom = params.get('room');
        if (existingRoom) return existingRoom;
        // Generate a stable room ID for this session/movie
        return `room_${id}_${Math.random().toString(36).substr(2, 5)}`;
    }, [id, location.search]);

    useEffect(() => {
        let unsub = null;
        let demoTimeout = setTimeout(() => {
            if (loading && !error) {
                console.log("Switching to Demo Mode due to Firebase delay...");
                setLoading(false);
                setMessages([
                    { text: "Welcome to the Watch Party! (Demo Mode)", user: "System", avatar: "/avatars/kids.svg", timestamp: "Now", uid: "sys" },
                    { text: "Firebase is currently in maintenance, but you can still test the UI here.", user: "System", avatar: "/avatars/kids.svg", timestamp: "Now", uid: "sys" }
                ]);
            }
        }, 6000); // Wait 6 seconds before falling back

        const initRoom = async () => {
            console.log("Initializing Watch Party Room:", roomId);
            try {
                const roomRef = doc(db, "watchParties", roomId);
                const roomSnap = await getDoc(roomRef);
                
                if (!roomSnap.exists()) {
                    await setDoc(roomRef, {
                        videoId: id,
                        type: type,
                        createdAt: serverTimestamp(),
                        host: profile?.name || user?.email || 'Guest',
                        members: [],
                        messages: []
                    });
                }

                await updateDoc(roomRef, {
                    members: arrayUnion({
                        name: profile?.name || 'Guest',
                        avatar: profile?.avatar || '',
                        uid: user?.uid || 'guest'
                    })
                });

                unsub = onSnapshot(roomRef, (docSnap) => {
                    clearTimeout(demoTimeout);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setMessages(data.messages || []);
                        setMembers(data.members || []);
                        setLoading(false);
                    }
                }, (err) => {
                    console.error("Firestore Snapshot Error:", err);
                    // Don't set error, let demo mode take over
                });

            } catch (err) {
                console.error("Watch Party Init Error:", err);
                // Don't set error, let demo mode take over
            }
        };

        initRoom();

        return () => {
            if (unsub) unsub();
            clearTimeout(demoTimeout);
        };
    }, [roomId, id, type, user?.uid, profile?.name]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !roomId) return;

        const newMessage = {
            text: input,
            user: profile?.name || 'Guest',
            avatar: profile?.avatar || '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            uid: user?.uid || 'guest'
        };

        try {
            const roomRef = doc(db, "watchParties", roomId);
            await updateDoc(roomRef, {
                messages: arrayUnion(newMessage)
            });
            setInput('');
        } catch (err) {
            console.warn("Falling back to local message (Demo Mode)");
            setMessages(prev => [...prev, newMessage]);
            setInput('');
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const copyInvite = () => {
        const inviteLink = `${window.location.origin}/watch-party/${type}/${id}?room=${roomId}`;
        navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied!");
    };

    if (error) return (
        <div className="watchParty_error">
            <h2>Oops!</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)}>Go Back</button>
            <button onClick={() => window.location.reload()} style={{ marginLeft: '10px' }}>Retry</button>
        </div>
    );

    if (loading) return (
        <div className="watchParty_loading">
            <div className="loader"></div>
            <p>Joining Watch Party...</p>
            <p style={{ fontSize: '12px', marginTop: '10px', color: '#aaa' }}>Room ID: {roomId}</p>
        </div>
    );

    return (
        <div className="watchParty">
            <div className="watchParty_playerArea">
                <Player isWatchParty={true} />
                
                <div className="watchParty_inviteToast">
                    <div className="invite_info">
                        <IoPeople size={20} />
                        <span>{members.length} watching</span>
                    </div>
                    <button onClick={copyInvite} className="invite_btn">
                        <IoCopyOutline /> Invite
                    </button>
                    <IoClose className="invite_close" onClick={() => setShowInvite(false)} style={{ display: showInvite ? 'block' : 'none' }} />
                </div>
            </div>

            <div className="watchParty_chatArea">
                <div className="chat_header">
                    <h3>WATCH PARTY CHAT</h3>
                    <span className="online_count">{members.length} Online</span>
                </div>

                <div className="chat_messages">
                    {messages.length === 0 ? (
                        <p className="no_messages">No messages yet. Say hi!</p>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`message_bubble ${msg.uid === user?.uid ? 'own' : ''}`}>
                                <img src={msg.avatar} alt="" className="msg_avatar" />
                                <div className="msg_content">
                                    <div className="msg_info">
                                        <span className="msg_user">{msg.user}</span>
                                        <span className="msg_time">{msg.timestamp}</span>
                                    </div>
                                    <p className="msg_text">{msg.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form className="chat_input" onSubmit={sendMessage}>
                    <input 
                        type="text" 
                        placeholder="Say something..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit">
                        <IoSend size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default WatchParty;

