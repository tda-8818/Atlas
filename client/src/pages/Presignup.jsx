import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@headlessui/react';
import LogoImage from '../assets/LogoName.png';

const Presignup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden w-full bg-[radial-gradient(600px_circle_at_20%_80%,rgba(100,120,220,0.05)_0%,transparent_80%),radial-gradient(600px_circle_at_80%_20%,rgba(100,120,220,0.05)_0%,transparent_80%),repeating-radial-gradient(circle_at_center,rgba(100,120,220,0.03)_0px,rgba(100,120,220,0.03)_1px,transparent_1px,transparent_150px)] bg-no-repeat bg-center bg-cover">
      <header className="max-w-4xl mx-auto bg-white/80 rounded-xl backdrop-blur-sm flex justify-between items-center p-4 shadow-md relative z-10">
        <div className="flex items-center">
          <img src={LogoImage} alt="Uniflow" className="h-20 w-auto block max-w-none" />
        </div>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/signup')} className="bg-[var(--color-primary)] text-white py-3 px-6 rounded-md font-semibold border-none cursor-pointer font-sans transition-colors duration-300 text-base hover:bg-blue-500">
            Sign Up
          </Button>
          <Button onClick={() => navigate('/login')} className="bg-gray-600 text-white py-3 px-6 rounded-md font-semibold border-none cursor-pointer font-sans transition-colors duration-300 text-base hover:bg-gray-500">
            Log In
          </Button>
        </div>
      </header>

      <section className="text-center mt-24 mb-16">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-5 tracking-tight">
          Task Management That Flows With You
        </h1>
        <p className="text-xl text-gray-600">Organise. Prioritise. Flow.</p>
      </section>

      <section className="flex justify-center flex-wrap mx-auto gap-10 max-w-7xl px-5">
        <div className="bg-white/90 rounded-xl p-6 text-center w-56 h-72 shadow-lg flex flex-col justify-between transition-transform transform hover:translate-y-[-5px] hover:shadow-2xl border border-blue-100">
          <div className="bg-blue-100/80 w-full p-3 rounded-lg shadow-inner border border-blue-200">
            <div className="flex justify-between items-center mb-3 font-semibold text-sm text-gray-700">
              <span className="text-left flex-grow">Month 2025</span>
              <span className="text-right flex-grow text-base opacity-70">◀ ▶</span>
            </div>
            <div className="grid grid-cols-7 gap-px text-xs text-gray-500 text-center">
              <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
            </div>
          </div>
          <div className="mt-auto">
            <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">Plan Smarter</h3>
            <p className="text-sm text-gray-600 mb-0">Stay ahead with intuitive planning.</p>
          </div>
        </div>

        <div className="bg-white/90 rounded-xl p-6 text-center w-56 h-72 shadow-lg flex flex-col justify-between transition-transform transform hover:translate-y-[-5px] hover:shadow-2xl border border-blue-100">
          <div className="bg-blue-100/80 w-full h-full rounded-lg relative shadow-inner border border-blue-200 p-2">
            <div className="absolute top-1/4 left-4 w-4/5 h-5 bg-indigo-300 rounded-md"></div>
            <div className="absolute top-1/2 left-4 w-2/5 h-5 bg-indigo-300 rounded-md"></div>
            <div className="absolute left-1/2 top-1/4 h-10 w-px bg-red-500 rounded-full"></div>
          </div>

          <div className="mt-auto">
            <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">Track Better</h3>
            <p className="text-sm text-gray-600 mb-0">Visualise and optimise your progress.</p>
          </div>
        </div>

        <div className="bg-white/90 rounded-xl p-6 text-center w-56 h-72 shadow-lg flex flex-col justify-between transition-transform transform hover:translate-y-[-5px] hover:shadow-2xl border border-blue-100">
          <div className="bg-gray-200 text-gray-800 rounded-xl p-3 w-fit max-w-[80%] relative">
            <div className="text-sm font-medium">Hello World!</div>
            <div className="absolute bottom-1 left-2 -rotate-12 w-3 h-3 bg-gray-200"></div> {/* Tail */}
          </div>
          <div className="bg-blue-200 text-gray-800 rounded-xl p-3 w-fit max-w-[80%] self-end relative">
            <div className="text-sm font-medium">Hello!</div>
            <div className="absolute bottom-1 right-2 rotate-12 w-3 h-3 bg-blue-200"></div> {/* Tail */}
          </div>


          <div className="hover:translate-y-[-5px] hover:shadow-xl transition-transform duration-300">
            <div className="mt-auto">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">Collaborate Easily</h3>
              <p className="text-sm text-gray-600 mb-0">Work together without friction.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 rounded-xl p-6 text-center w-56 h-72 shadow-lg flex flex-col justify-between transition-transform transform hover:translate-y-[-5px] hover:shadow-2xl border border-blue-100">
          <div className="bg-blue-100/80 w-full h-full flex items-center justify-center text-7xl rounded-lg border border-blue-200 backdrop-blur-sm">
            <div className="text-8xl">⚙️</div>
          </div>
          <div className="hover:translate-y-[-5px] hover:shadow-xl transition-transform duration-300">
            <div className="mt-auto">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">Optimise Workflow</h3>
              <p className="text-sm text-gray-600 mb-0">Simplify complex projects</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Presignup;