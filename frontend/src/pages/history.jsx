import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ReactMarkdown from 'react-markdown';
import "../App.css";

export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [openRecap, setOpenRecap] = useState(false);
    const [activeRecap, setActiveRecap] = useState("");
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // TODO: Snackbar
            }
        }
        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return (
        <div className="historyPageContainer">
            <div className="bgMesh" />

            {/* Sticky nav */}
            <div className="historyNav">
                <button
                    className="btn-pill btn-pill-ghost"
                    onClick={() => routeTo("/home")}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px' }}
                >
                    <ArrowBackIcon style={{ fontSize: '1rem' }} />
                    Back
                </button>
                <h2>NEXUS</h2>
            </div>

            {/* Content */}
            <div className="historyContent">
                <h1 className="historyTitle">Meeting History</h1>
                <p className="historySubtitle">Review your past sessions and AI-powered recaps.</p>

                {meetings.length === 0 ? (
                    <div className="emptyHistory">
                        <VideoCallIcon style={{ fontSize: '3rem', display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                        <h3>No meetings yet</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            Start a video call and it'll appear here.
                        </p>
                    </div>
                ) : meetings.map((e, i) => (
                    <div key={i} className="meetingCard" style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className="meetingCardInfo">
                            <span className="meetingCode"># {e.meetingCode}</span>
                            <span className="meetingDate">{formatDate(e.date)}</span>
                        </div>
                        <button
                            className="btn-pill btn-pill-outline"
                            style={{ fontSize: '0.84rem', padding: '8px 20px' }}
                            onClick={() => {
                                setActiveRecap(e.recap_markdown || "");
                                setOpenRecap(true);
                            }}
                        >
                            View Recap
                        </button>
                    </div>
                ))}
            </div>

            {/* Recap dialog (keep MUI for functionality) */}
            <Dialog
                open={openRecap}
                onClose={() => setOpenRecap(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        background: 'rgba(15,9,5,0.94)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(249,115,22,0.14)',
                        borderRadius: '20px',
                        color: '#fdf4ee',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
                    }
                }}
            >
                <DialogTitle style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    borderBottom: '1px solid rgba(249,115,22,0.1)',
                    paddingBottom: '16px',
                    background: 'linear-gradient(90deg, #fb923c, #f87171)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Meeting Recap
                </DialogTitle>
                <DialogContent style={{ paddingTop: '20px', color: '#f5d9c8' }}>
                    {activeRecap ? (
                        <div style={{ lineHeight: 1.8 }}>
                            <ReactMarkdown>{activeRecap}</ReactMarkdown>
                        </div>
                    ) : (
                        <p style={{ color: 'rgba(240,244,255,0.45)', fontStyle: 'italic' }}>
                            No recap available for this meeting.
                        </p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
