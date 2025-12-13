import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@headlessui/react';
import logo from '../assets/logo.png';
import { LuChartLine, LuUsers, LuSquare, LuZap } from 'react-icons/lu';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden magnetic-scroll">
      {/* Navigation Header */}
      <header className="bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border-color)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Atlas" className="h-10 w-10 rounded-full shadow-lg ring-2 ring-[var(--color-primary)]/20" />
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full blur opacity-20"></div>
            </div>
            <span className="text-2xl font-bold text-[var(--text)]">
              Atlas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 text-[var(--text)] font-medium hover:bg-[var(--background-primary)] rounded-xl transition-all duration-300 magnetic-item"
            >
              Log In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:bg-[var(--color-primary-hover)] transform hover:scale-105 transition-all duration-300 magnetic-item"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="space-y-8 mb-16">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight tracking-tight">
              Navigate Your Work.<br />
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                Conquer Your Goals.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-muted)] font-normal max-w-3xl mx-auto leading-relaxed">
              The intelligent task management platform that adapts to your workflow
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-[var(--color-primary)] text-white text-lg font-medium rounded-xl shadow-xl hover:shadow-2xl hover:bg-[var(--color-primary-hover)] transform hover:scale-105 transition-all duration-300 flex items-center gap-3 magnetic-item"
            >
              <LuZap className="w-5 h-5" />
              Start Free Today
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-[var(--border-color)] text-[var(--text)] text-lg font-medium rounded-xl hover:bg-[var(--background-primary)] transition-all duration-300 magnetic-item"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20">
          <div className="bg-[var(--background-modal)] backdrop-blur-sm rounded-2xl p-8 border border-[var(--border-color-accent)] shadow-sm hover:shadow-md transition-all duration-300 magnetic-item">
            <div className="text-4xl font-bold text-[var(--color-primary)]">500+</div>
            <div className="text-[var(--text-muted)] font-medium mt-2">Teams Worldwide</div>
          </div>
          <div className="bg-[var(--background-modal)] backdrop-blur-sm rounded-2xl p-8 border border-[var(--border-color-accent)] shadow-sm hover:shadow-md transition-all duration-300 magnetic-item">
            <div className="text-4xl font-bold text-[var(--color-primary)]">50k+</div>
            <div className="text-[var(--text-muted)] font-medium mt-2">Tasks Completed</div>
          </div>
          <div className="bg-[var(--background-modal)] backdrop-blur-sm rounded-2xl p-8 border border-[var(--border-color-accent)] shadow-sm hover:shadow-md transition-all duration-300 magnetic-item">
            <div className="text-4xl font-bold text-[var(--color-primary)]">99%</div>
            <div className="text-[var(--text-muted)] font-medium mt-2">Client Retention</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-6">
            Everything You Need to <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">Succeed</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Powerful features designed to keep you organized, productive, and ahead of schedule
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="group bg-[var(--background-modal)] rounded-2xl p-8 border border-[var(--border-color-accent)] hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300 magnetic-item">
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuChartLine className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-3">
              Smart Analytics
            </h3>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              Track progress with intelligent insights and data-driven recommendations
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-[var(--background-modal)] rounded-2xl p-8 border border-[var(--border-color-accent)] hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300 magnetic-item">
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuUsers className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-3">
              Team Collaboration
            </h3>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              Seamlessly collaborate with your team in real-time, anywhere
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-[var(--background-modal)] rounded-2xl p-8 border border-[var(--border-color-accent)] hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300 magnetic-item">
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuSquare className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-3">
              Flexible Workflows
            </h3>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              Customize your workflow to match how your team actually works
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-[var(--background-modal)] rounded-2xl p-8 border border-[var(--border-color-accent)] hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300 magnetic-item">
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LuZap className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-3">
              Lightning Fast
            </h3>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              Built for speed with instant updates and zero lag
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color-accent)] bg-[var(--background-modal)]/50 backdrop-blur-sm mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={logo} alt="Atlas" className="h-8 w-8 rounded-full shadow-sm" />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-full blur opacity-60"></div>
              </div>
              <span className="font-semibold text-[var(--text)]">Atlas</span>
              <span className="text-[var(--text-muted)]">• Navigate Your Work</span>
            </div>
            <div className="text-[var(--text-muted)] text-sm">
              © 2025 Atlas. Built with precision
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
