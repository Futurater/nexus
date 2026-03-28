import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import useTranscription from '../hooks/useTranscription';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    let [summarizeOpen, setSummarizeOpen] = useState(false)
    let [transcriptText, setTranscriptText] = useState("")
    let [recapMarkdown, setRecapMarkdown] = useState("")
    let [summarizeLoading, setSummarizeLoading] = useState(false)
    let [summarizeError, setSummarizeError] = useState("")
    let [meetingLog, setMeetingLog] = useState([])
    const transcriptListRef = useRef(null)
    const [manualNote, setManualNote] = useState("")
    const [showTranscript, setShowTranscript] = useState(false)

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        getPermissions();
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream
        updateMediaSenders()

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            updateMediaSenders()
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream
        updateMediaSenders()

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('new-transcript-entry', (data, socketIdSender) => {
                if (socketIdSender !== socketIdRef.current) {
                    setMeetingLog(prev => [...prev, data])
                }
            })

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    if (socketListId === socketIdRef.current) {
                        return;
                    }

                    if (connections[socketListId]) {
                        return;
                    }

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        const next = !video;
        setVideo(next);
        if (!next) {
            try {
                if (window.localStream) {
                    window.localStream.getVideoTracks().forEach(t => t.stop())
                }
                const audioTracks = window.localStream ? window.localStream.getAudioTracks() : [];
                const onlyAudio = new MediaStream(audioTracks);
                window.localStream = onlyAudio;
                if (localVideoref.current) localVideoref.current.srcObject = onlyAudio;
                updateMediaSenders();
            } catch (e) { console.log(e) }
        } else {
            navigator.mediaDevices.getUserMedia({ video: true, audio: audioAvailable })
                .then(s => {
                    window.localStream = s;
                    if (localVideoref.current) localVideoref.current.srcObject = s;
                    updateMediaSenders();
                })
                .catch(e => console.log(e))
        }
    }
    let handleAudio = () => {
        const next = !audio;
        setAudio(next);
        if (window.localStream) {
            const tracks = window.localStream.getAudioTracks();
            tracks.forEach(t => t.enabled = next);
        }
        normalizeAudioSenders(next);
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    const onFinalCommit = (text) => {
        const entry = { user: username || 'Guest', text, timestamp: Date.now() }
        setMeetingLog(prev => [...prev, entry])
        if (socketRef.current) {
            socketRef.current.emit('new-transcript-entry', entry)
        }
    }
    const { isSupported, isListening, interimText, permissionError, start, stop } = useTranscription(onFinalCommit, { lang: 'en-IN' })

    useEffect(() => {
        if (transcriptListRef.current) {
            transcriptListRef.current.scrollTop = transcriptListRef.current.scrollHeight
        }
    }, [meetingLog])
    let renegotiateAll = () => {
        for (let id in connections) {
            try {
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            } catch (e) { console.log(e) }
        }
    }

    let normalizeAudioSenders = (next) => {
        for (let id in connections) {
            try {
                const pc = connections[id];
                const senders = pc.getSenders().filter(s => s.track && s.track.kind === 'audio');
                senders.forEach(s => {
                    if (s.track) s.track.enabled = next;
                });
                for (let i = 1; i < senders.length; i++) {
                    try { pc.removeTrack(senders[i]) } catch (e) { console.log(e) }
                }
            } catch (e) { console.log(e) }
        }
        renegotiateAll();
    }
    let updateMediaSenders = () => {
        for (let id in connections) {
            try {
                const pc = connections[id];
                const senders = pc.getSenders();
                const vTrack = window.localStream.getVideoTracks()[0];
                const aTrack = window.localStream.getAudioTracks()[0];
                const vSenders = senders.filter(s => s.track && s.track.kind === 'video');
                const aSenders = senders.filter(s => s.track && s.track.kind === 'audio');
                if (vTrack) {
                    if (vSenders[0]) { vSenders[0].replaceTrack(vTrack) } else { pc.addTrack(vTrack, window.localStream) }
                    for (let i = 1; i < vSenders.length; i++) { try { pc.removeTrack(vSenders[i]) } catch (e) { console.log(e) } }
                } else {
                    vSenders.forEach(s => { try { pc.removeTrack(s) } catch (e) { console.log(e) } })
                }
                if (aTrack) {
                    if (aSenders[0]) { aSenders[0].replaceTrack(aTrack) } else { pc.addTrack(aTrack, window.localStream) }
                    for (let i = 1; i < aSenders.length; i++) { try { pc.removeTrack(aSenders[i]) } catch (e) { console.log(e) } }
                } else {
                    aSenders.forEach(s => { try { pc.removeTrack(s) } catch (e) { console.log(e) } })
                }
            } catch (e) { console.log(e) }
        }
        renegotiateAll();
    }
    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div className={styles.lobbyContainer}>


                    <h2 className={styles.lobbyTitle}>Enter into Lobby</h2>
                    <div className={styles.lobbyActions}>
                        <TextField
                            id="outlined-basic"
                            label="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            variant="outlined"
                            sx={{ minWidth: '240px' }}
                        />
                        <Button
                            variant="contained"
                            onClick={connect}
                            sx={{
                                backgroundColor: '#2563EB',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#1E4ED8' }
                            }}
                        >
                            Connect
                        </Button>
                    </div>


                    <div className={styles.lobbyPreview}>
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>

                </div> :


                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>

                            <div className={styles.chattingDisplay}>

                                {messages.length !== 0 ? messages.map((item, index) => {

                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}


                            </div>

                            <div className={styles.chattingArea}>
                                <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>


                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        <Button
                            variant="outlined"
                            onClick={() => (isListening ? stop() : start())}
                            sx={{ ml: 1, borderColor: '#2563EB', color: '#2563EB', textTransform: 'none' }}
                        >
                            {isListening ? "Stop Captions" : "Start Captions"}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setShowTranscript(!showTranscript)}
                            sx={{ ml: 1, borderColor: '#2563EB', color: '#2563EB', textTransform: 'none' }}
                        >
                            {showTranscript ? "Hide Log" : "Show Log"}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setSummarizeOpen(true)}
                            sx={{ backgroundColor: '#2563EB', textTransform: 'none', ml: 1 }}
                        >
                            Summarize
                        </Button>

                        <IconButton
                            onClick={handleScreen}
                            disabled={!screenAvailable}
                            style={{ color: "white", opacity: screenAvailable ? 1 : 0.5 }}
                        >
                            {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                        </IconButton>

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>

                    {interimText && (
                        <div className={styles.captionsOverlay}>
                            {interimText}
                        </div>
                    )}

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={showTranscript ? styles.conferenceView : styles.conferenceViewChatOnly}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video

                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>

                        ))}

                    </div>

                    {showTranscript ? <div className={styles.transcriptSidebar} ref={transcriptListRef}>
                        <h3>Meeting Log</h3>
                        {!isSupported ? <p style={{ color: 'salmon' }}>Captions unavailable in this browser — use Add Note or try Chrome</p> : null}
                        {permissionError === 'permission-denied' ? <p style={{ color: 'salmon' }}>Mic permission denied</p> : null}
                        {permissionError === 'no-speech' ? <p style={{ color: 'salmon' }}>No speech detected — try again</p> : null}
                        {permissionError === 'no-mic' ? <p style={{ color: 'salmon' }}>Microphone not available</p> : null}
                        {meetingLog.map((entry, idx) => (
                            <div key={idx} className={styles.transcriptItem}>
                                <p style={{ fontWeight: 600 }}>{entry.user}</p>
                                <p>{entry.text}</p>
                            </div>
                        ))}
                        <div className={styles.transcriptControls}>
                            <TextField
                                value={manualNote}
                                onChange={(e) => setManualNote(e.target.value)}
                                label="Add note"
                                size="small"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-input': { color: '#fff' },
                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' }
                                }}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    const text = manualNote.trim();
                                    if (!text) return;
                                    const entry = { user: username || 'Guest', text, timestamp: Date.now() }
                                    setMeetingLog(prev => [...prev, entry])
                                    if (socketRef.current) {
                                        socketRef.current.emit('new-transcript-entry', entry)
                                    }
                                    setManualNote("");
                                }}
                                sx={{ mt: 1, borderColor: '#2563EB', color: '#2563EB', textTransform: 'none' }}
                            >
                                Add Note
                            </Button>
                        </div>
                    </div> : null}

                </div>

            }

            <Dialog open={summarizeOpen} onClose={() => setSummarizeOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>Generate Smart Recap</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Paste transcript"
                        value={transcriptText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        multiline
                        minRows={6}
                        fullWidth
                        sx={{ my: 2 }}
                    />
                    <Button
                        variant="contained"
                        onClick={async () => {
                            try {
                                setSummarizeLoading(true);
                                setSummarizeError("");
                                setRecapMarkdown("");
                                const code = window.location.pathname.replace("/", "");
                                const compiled = meetingLog.length
                                  ? meetingLog.map(e => `${e.user}: ${e.text}`).join("\n")
                                  : transcriptText;
                                const resp = await fetch(`${server_url}/api/meetings/summarize`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ meetingCode: code, transcript: compiled })
                                });
                                const data = await resp.json();
                                if (!resp.ok) {
                                    setSummarizeError(data?.message || "Failed to summarize.");
                                } else {
                                    setRecapMarkdown(data.recap || "");
                                }
                            } catch (e) {
                                setSummarizeError((e && e.message) ? e.message : "Failed to summarize.");
                            } finally {
                                setSummarizeLoading(false);
                            }
                        }}
                        sx={{ backgroundColor: '#2563EB', textTransform: 'none' }}
                    >
                        {summarizeLoading ? "Summarizing..." : "Summarize"}
                    </Button>
                    {summarizeError ? (
                        <p style={{ color: "red", marginTop: 12 }}>{summarizeError}</p>
                    ) : null}
                    {recapMarkdown ? (
                        <div style={{ marginTop: 16 }}>
                            <ReactMarkdown>{recapMarkdown}</ReactMarkdown>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
