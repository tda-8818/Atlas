import React from 'react';
import Navbar from '../components/Navbar'
import './css/Home.css';

const Home = () => {
    const projects = [
      {
        title: 'Creating Mobile App Design',
        subtitle: 'UI UX Design',
        progress: 75,
        daysLeft: 3,
        image: 'https://via.placeholder.com/300x180',
        team: ['/avatars/avatar1.png', '/avatars/avatar2.png']
      },
      {
        title: 'Creating Perfect Website',
        subtitle: 'Web Developer',
        progress: 85,
        daysLeft: 4,
        image: 'https://via.placeholder.com/300x180',
        team: ['/avatars/avatar3.png', '/avatars/avatar4.png']
      },
      {
        title: 'Building Dashboard',
        subtitle: 'React Developer',
        progress: 60,
        daysLeft: 6,
        image: 'https://via.placeholder.com/300x180',
        team: ['/avatars/avatar5.png', '/avatars/avatar6.png']
      },
      {
        title: 'Design New Logo',
        subtitle: 'Graphic Design',
        progress: 40,
        daysLeft: 2,
        image: 'https://via.placeholder.com/300x180',
        team: ['/avatars/avatar7.png', '/avatars/avatar8.png']
      },
      {
        title: 'Develop Landing Page',
        subtitle: 'Frontend Developer',
        progress: 90,
        daysLeft: 1,
        image: 'https://via.placeholder.com/300x180',
        team: ['/avatars/avatar9.png', '/avatars/avatar10.png']
      },
      {
        title: 'Fix Website Bugs',
        subtitle: 'QA Engineer',
        progress: 55,
        daysLeft: 5,
        image: 'https://via.placeholder.com/300x180',
        team: ['/avatars/avatar11.png', '/avatars/avatar12.png']
      },
      // You can add even more...
    ];
  
    return (
      <div className="home-page">
        <Navbar />
        <div className="home">
          <h1 className="home-title">Projects</h1>
          <div className="cards-container">
            {projects.map((project, index) => (
              <div className="card" key={index}>
                <img src={project.image} alt="project" className="card-image" />
                <div className="card-body">
                  <h2 className="card-title">{project.title}</h2>
                  <p className="card-subtitle">{project.subtitle}</p>
                  <div className="progress-section">
                    <div className="progress-text">Progress</div>
                    <div className="progress-value">{project.progress}%</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="footer">
                    <div className="days-left">
                      <i className="far fa-clock"></i> {project.daysLeft} Days Left
                    </div>
                    <div className="avatars">
                      {project.team.map((avatar, idx) => (
                        <img key={idx} src={avatar} alt="team member" className="avatar" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default Home;