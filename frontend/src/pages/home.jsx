import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <>

            <div className="navBar">

                <div style={{ display: "flex", alignItems: "center" }}>

                    <h2>NEXUS</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingRight: "32px" }}>
                    <Button
                        onClick={() => navigate("/history")}
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        sx={{
                            borderColor: '#2563EB',
                            color: '#2563EB',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: '#1E4ED8',
                                backgroundColor: 'rgba(37,99,235,0.08)'
                            }
                        }}
                    >
                        History
                    </Button>

                    <Button
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                        variant="contained"
                        sx={{
                            backgroundColor: '#2563EB',
                            color: '#fff',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1E4ED8' }
                        }}
                    >
                        Logout
                    </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Keep the conversation going, wherever you are.</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                            <Button
                                onClick={handleJoinVideoCall}
                                variant='contained'
                                sx={{
                                    backgroundColor: '#2563EB',
                                    color: '#fff',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#1E4ED8' }
                                }}
                            >
                                Join
                            </Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </>
    )
}


export default withAuth(HomeComponent)
