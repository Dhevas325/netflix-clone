import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const user = useSelector(selectUser);
    const profile = useSelector(selectActiveProfile);
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [members, setMembers] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [showInvite, setShowInvite] = useState(true);
    
    const chatEndRef = useRef(null);

    useEffect(() => {
        let unsub = () => {};
        const rid = new URLSearchParams(window.location.search).get('room') || 
                    `room_${id}_${Math.random().toString(36).substr(2, 5)}`;
        setRoomId(rid);

        const initRoom = async () => {
            try {
                const roomRef = doc(db, "watchParties", rid);
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

                // Add current user to members
                await updateDoc(roomRef, {
                    members: arrayUnion({
                        name: profile?.name || 'Guest',
                        avatar: profile?.avatar || '',
                        uid: user?.uid || 'guest'
                    })
                });

                // Listen for updates
                unsub = onSnapshot(roomRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        setMessages(data.messages || []);
                        setMembers(data.members || []);
                        setLoading(false);
                    }
                }, (err) => {
                    console.error("Firestore error:", err);
                    setError("Lost connection to the room.");
                });

            } catch (err) {
                console.error("Failed to join room:", err);
                setError("Could not create or join the watch party: " + (err.message || err.toString()));
                setLoading(false);
            }
        };

        initRoom();
        return () => unsub();
    }, [id, type, user, profile]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !roomId) return;

        try {
            const roomRef = doc(db, "watchParties", roomId);
            await updateDoc(roomRef, {
                messages: arrayUnion({
                    text: input,
                    user: profile?.name || 'Guest',
                    avatar: profile?.avatar || '',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    uid: user?.uid || 'guest'
                })
            });
            setInput('');
        } catch (err) {
            console.error("Send message error:", err);
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
            <h2>Oops! {error}</h2>
            <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    if (loading) return (
        <div className="watchParty_loading">
            <div className="loader"></div>
            <p>Joining Watch Party...</p>
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
                    {messages.map((msg, i) => (
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
                    ))}
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
