import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            <div className="bgMesh" />

            <nav>
                <div className='navHeader'>
                    <h2>NEXUS</h2>
                </div>
                <div className='navlist'>
                    <p onClick={() => router("/aljk23")}>Join as Guest</p>
                    <p onClick={() => router("/auth")}>Register</p>
                    <div onClick={() => router("/auth")} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className="heroCopy">
                    <div className="heroBadge">Secure · Reliable · Free</div>
                    <h1>
                        <span style={{
                            background: 'linear-gradient(135deg, #fb923c, #f87171)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>Connect</span>
                        {' '}with your loved Ones
                    </h1>
                    <p>Your go-to video conferencing platform for reliable and secure virtual meetings — wherever you are.</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started →</Link>
                    </div>
                </div>

                <div className="heroImage">
                    <img src="/video_conference_demo.png" alt="Nexus video call preview" />
                </div>
            </div>
        </div>
    )
}
