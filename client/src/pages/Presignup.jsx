import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../assets/LogoNameDark.png';

const Presignup = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="presignup-container">
      <header>
        <div className="logo">
          <img src={LogoImage} alt="Uniflow" />
        </div>
        <div className="nav-actions">
          <button onClick={handleGetStarted} className="btn-primary">Get Started Free</button>
        </div>
      </header>

      <section className="hero">
        <h1>Task Management That Flows With You</h1>
        <p>Organize. Prioritize. Flow.</p>
      </section>

      <section className="cards">
        <div className="card">
          <div className="calendar-container">
            <div className="calendar">
              <div className="calendar-header">
                <span>Month 2025</span>
                <span>◀ ▶</span>
              </div>
              <div className="calendar-grid">
                <div className="day-name">M</div>
                <div className="day-name">T</div>
                <div className="day-name">W</div>
                <div className="day-name">T</div>
                <div className="day-name">F</div>
                <div className="day-name">S</div>
                <div className="day-name">S</div>
              </div>
            </div>
          </div>
          <div className="card-content">
            <h3>Plan Smarter</h3>
            <p>Stay ahead with intuitive planning.</p>
          </div>
        </div>
        
        <div className="card">
          <div className="gantt-container">
            <div className="gantt-chart">
              {/* Gantt Chart Bars */}
              <div className="gantt-bar-long"></div>
              <div className="gantt-bar-short"></div>
              <div className="gantt-line"></div>
            </div>
          </div>
          <div className="card-content">
            <h3>Track Better</h3>
            <p>Visualize and optimize your progress.</p>
          </div>
        </div>
        
        <div className="card">
          <div className="message-container">
            <div className="message">
              <div className="message-bar-left">Hello World!</div>
              <div className="message-bar-right">Hello World!</div>
            </div>
          </div>
          <div className="card-content">
            <h3>Collaborate Easily</h3>
            <p>Work together without friction.</p>
          </div>
        </div>
        
        <div className="card">
          <div className="visual-container">
            <div className="visual-no-bg">⚙️</div>
          </div>
          <div className="card-content">
            <h3>Optimize Workflows</h3>
            <p>Simplify complex processes.</p>
          </div>
        </div>
      </section>

      <style>
        {`
        .presignup-container {
          margin: 0;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: radial-gradient(600px circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 80%),
                      radial-gradient(600px circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 80%),
                      repeating-radial-gradient(
                        circle at center,
                        rgba(255,255,255,0.15) 0px,
                        rgba(255,255,255,0.15) 1px,
                        transparent 1px,
                        transparent 150px
                      );
          background-color: #1A237E;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          color: #E0E0E0;
          /* 修复白色部分露出问题 */
          overflow-x: hidden;
          width: 100%;
        }

        header {
          max-width: 900px;
          margin: 20px auto;
          background: rgba(45, 62, 139, 0.3);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          box-shadow: none;
          position: relative;
          z-index: 100;
        }

        .logo {
          display: flex;
          align-items: center;
        }

        .logo img {
          height: 80px; /* 增加到80px */
          width: auto;
          display: block;
          max-width: none; /* 防止图片缩小 */
        }

        .btn-primary {
          background: #3A5ECC;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background-color 0.3s ease;
          font-size: 16px; /* 使按钮更大，平衡标题 */
        }

        .btn-primary:hover {
          background: #2A4EBB;
        }

        .hero {
          text-align: center;
          margin-top: 100px;
          margin-bottom: 60px;
        }
        
        .hero h1 {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 20px;
          color: #FFFFFF;
          letter-spacing: 1px;
        }
        
        .hero p {
          font-size: 20px;
          color: #BBBBBB;
        }

        .cards {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          margin: 0 auto;
          gap: 40px;
          max-width: 1300px;
          padding: 0 20px;
        }

        .card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          width: 220px;
          height: 280px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .card-content {
          margin-top: auto;
        }

        .calendar-container, .gantt-container, .message-container, .visual-container {
          height: 150px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calendar {
          background: rgba(255, 255, 255, 0.1);
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 700;
          font-size: 14px;
        }
        
        .calendar-header span:first-child {
          flex-grow: 1;
          text-align: left;
        }
        
        .calendar-header span:last-child {
          flex-grow: 0;
          text-align: right;
          font-size: 16px;
          opacity: 0.7;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          text-align: center;
        }

        .calendar-grid div {
          font-size: 12px;
          color: #eee;
          word-break: break-word;
          padding: 4px 0;
        }

        .calendar-grid .day-name {
          font-weight: 600;
          color: #aaa;
        }

        .gantt-chart {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          position: relative;
          padding: 10px;
        }

        .gantt-bar-long {
          width: 80%;
          height: 20px;
          background-color: #888;
          position: absolute;
          top: 40px;
          right: 10px;
          border-radius: 5px;
        }

        .gantt-bar-short {
          width: 40%;
          height: 20px;
          background-color: #888;
          position: absolute;
          top: 80px;
          right: 10px;
          border-radius: 5px;
        }

        .gantt-line {
          width: 2px;
          background-color: red;
          position: absolute;
          top: 20px;
          left: 50%;
          height: calc(100% - 40px);
          border-radius: 5px;
        }

        .message {
          width: 100%;
          height: 120%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          position: relative;
          padding: 10px;
          /* 移除了下移的margin-top */
        }

        .message-bar-left {
          width: 70%;
          height: 30px; /* 增加高度以容纳文本 */
          background-color: #888;
          position: absolute;
          top: 30px;
          left: 15px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #fff;
          font-weight: 500;
          z-index: 2; /* 确保在磨砂背景上方 */
        }

        .message-bar-right {
          width: 50%;
          height: 30px; /* 增加高度以容纳文本 */
          background-color: #888;
          position: absolute;
          top: 80px;
          right: 15px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #fff;
          font-weight: 500;
          z-index: 2; /* 确保在磨砂背景上方 */
        }

        .visual {
          font-size: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
        }
        
        .visual-no-bg {
          font-size: 80px; /* 因为没有背景，可以稍微增大一些 */
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          /* 移除了背景和模糊效果 */
        }

        .card h3 {
          font-size: 20px;
          margin: 10px 0 6px;
          color: #FFFFFF;
        }

        .card p {
          font-size: 14px;
          color: #CCCCCC;
          margin-bottom: 0;
        }

        @media (max-width: 1024px) {
          .cards {
            max-width: 600px;
          }
          
          .card {
            width: 200px;
          }
          
          .logo img {
            height: 70px; /* 在中等屏幕上稍微减小尺寸 */
          }
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 36px;
          }
          
          .hero p {
            font-size: 18px;
          }
          
          .cards {
            gap: 20px;
          }
          
          .card {
            width: 180px;
            height: 260px;
            padding: 20px;
          }
          
          .logo img {
            height: 60px; /* 在较小屏幕上进一步减小尺寸 */
          }
          
          header {
            padding: 14px 24px;
          }
        }

        @media (max-width: 480px) {
          .cards {
            flex-direction: column;
            align-items: center;
          }
          
          .card {
            width: 100%;
            max-width: 280px;
          }
          
          header {
            padding: 12px 20px;
            flex-direction: column;
            gap: 10px;
          }
          
          .logo img {
            height: 50px; /* 在最小屏幕上使用合适的尺寸 */
          }
          
          .btn-primary {
            padding: 8px 16px;
            font-size: 14px;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Presignup;