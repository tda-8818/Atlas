import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@headlessui/react';
import logo from '../assets/logo.png';
import { FaChartLine, FaUsers, FaTasks, FaRocket } from 'react-icons/fa';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f8ff] via-white to-[#e3f2fd] overflow-x-hidden">
      {/* Navigation Header */}
      <header className="backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Atlas" className="h-12 w-12 rounded-full shadow-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] bg-clip-text text-transparent">
              Atlas
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 text-[#0b80c3] font-semibold hover:bg-[#e3f2fd] rounded-full transition-all duration-300"
            >
              Log In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-[#0b80c3] via-[#0d9ae6] to-[#5eb8e5] bg-clip-text text-transparent leading-tight">
            Navigate Your Work,<br />Conquer Your Goals
          </h1>
          <p className="text-xl md:text-2xl text-[#546e7a] font-medium max-w-3xl mx-auto">
            The intelligent task management platform that adapts to your workflow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <FaRocket />
              Start Free Today
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-[#0b80c3] text-[#0b80c3] text-lg font-bold rounded-full hover:bg-[#0b80c3] hover:text-white transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#bbdefb]/50 shadow-lg">
            <div className="text-4xl font-black text-[#0b80c3]">100+</div>
            <div className="text-[#546e7a] font-medium mt-1">Active Users</div>
          </div>
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#bbdefb]/50 shadow-lg">
            <div className="text-4xl font-black text-[#0b80c3]">1k+</div>
            <div className="text-[#546e7a] font-medium mt-1">Tasks Completed</div>
          </div>
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-[#bbdefb]/50 shadow-lg">
            <div className="text-4xl font-black text-[#0b80c3]">98%</div>
            <div className="text-[#546e7a] font-medium mt-1">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-[#0b80c3]">
          Why Choose Atlas?
        </h2>
        <p className="text-center text-[#546e7a] text-lg mb-16 max-w-2xl mx-auto">
          Powerful features designed to keep you organised, productive, and ahead of schedule
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-[#bbdefb]/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-[#0b80c3] to-[#0d9ae6] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#0b80c3] mb-3">
              Smart Analytics
            </h3>
            <p className="text-[#546e7a] leading-relaxed">
              Track progress with intelligent insights and data-driven recommendations
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-[#bbdefb]/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-[#0b80c3] to-[#0d9ae6] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#0b80c3] mb-3">
              Team Collaboration
            </h3>
            <p className="text-[#546e7a] leading-relaxed">
              Seamlessly collaborate with your team in real-time, anywhere
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-[#bbdefb]/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-[#0b80c3] to-[#0d9ae6] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaTasks className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#0b80c3] mb-3">
              Flexible Workflows
            </h3>
            <p className="text-[#546e7a] leading-relaxed">
              Customse your workflow to match how your team actually works
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-[#bbdefb]/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-[#0b80c3] to-[#0d9ae6] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaRocket className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#0b80c3] mb-3">
              Lightning Fast
            </h3>
            <p className="text-[#546e7a] leading-relaxed">
              Built for speed with instant updates and zero lag
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#bbdefb] bg-white/50 backdrop-blur-lg mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Atlas" className="h-8 w-8 rounded-full" />
              <span className="font-bold text-[#0b80c3]">Atlas</span>
              <span className="text-[#546e7a]">• Navigate Your Work</span>
            </div>
            <div className="text-[#546e7a] text-sm">
              © 2025 Atlas. Built with ❤️ by TDA
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
