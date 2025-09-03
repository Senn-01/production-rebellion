import { useState, useEffect } from 'react';
import { Play, Square, Clock, Target as TargetIcon, Zap, Coffee, BatteryLow } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Project {
  id: number;
  title: string;
  category: string;
  isBossBattle: boolean;
}

type SessionState = 'setup' | 'willpower' | 'active' | 'completed' | 'interrupted';
type WillpowerLevel = 'high' | 'medium' | 'low';
type MindsetLevel = 'excellent' | 'good' | 'challenging';

const willpowerOptions = [
  { value: "high" as WillpowerLevel, label: "PIECE OF CAKE", sublabel: "HIGH WILLPOWER", icon: Zap },
  { value: "medium" as WillpowerLevel, label: "CAFFEINATED", sublabel: "MEDIUM WILLPOWER", icon: Coffee },
  { value: "low" as WillpowerLevel, label: "DON'T TALK TO ME", sublabel: "LOW WILLPOWER", icon: BatteryLow }
];

export function FocusPage() {
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<60 | 90 | 120>(60);
  const [willpowerLevel, setWillpowerLevel] = useState<WillpowerLevel | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  
  // Sample active projects
  const activeProjects: Project[] = [
    { id: 1, title: 'Q4 Revenue Push', category: 'WORK', isBossBattle: true },
    { id: 3, title: 'MVP Launch', category: 'BUILD', isBossBattle: true },
    { id: 8, title: 'Process Optimization', category: 'MANAGE', isBossBattle: true },
    { id: 2, title: 'React Advanced', category: 'LEARN', isBossBattle: false },
    { id: 5, title: 'Client Presentation', category: 'WORK', isBossBattle: false },
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionState === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setSessionState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [sessionState, timeRemaining]);

  const startSession = () => {
    if (!selectedProject) return;
    setSessionState('willpower');
  };

  const confirmWillpower = () => {
    if (!willpowerLevel) return;
    setTimeRemaining(sessionDuration * 60);
    setSessionStartTime(Date.now());
    setSessionState('active');
  };

  const interruptSession = () => {
    setSessionState('interrupted');
  };

  const completeSession = (mindset: MindsetLevel) => {
    setSessionState('setup');
    setSelectedProject('');
    setWillpowerLevel(null);
  };

  const getDifficultyQuote = () => {
    const difficulty = `${willpowerLevel}-${sessionDuration}`;
    const quotes = {
      'high-60': 'PIECE OF CAKE MODE',
      'high-90': 'WARM-UP SESSION',
      'high-120': 'CONFIDENCE BOOST',
      'medium-60': 'CAFFEINATED FOCUS',
      'medium-90': 'STEADY PROGRESS',
      'medium-120': 'MARATHON MINDSET',
      'low-60': 'SURVIVAL MODE',
      'low-90': 'GRIT CHALLENGE',
      'low-120': 'LEGENDARY ENDURANCE'
    };
    return quotes[difficulty as keyof typeof quotes] || 'FOCUS MODE';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSelectedProjectTitle = () => {
    const project = activeProjects.find(p => p.id.toString() === selectedProject);
    return project?.title || '';
  };

  return (
    <main className="px-8 py-10" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {sessionState === 'setup' && (
        <div className="min-h-[80vh] flex items-center justify-center">
          {/* Clean Focus Box - NO animations */}
          <div className="bg-[#CFE820] border-4 border-black p-12 shadow-[4px_4px_0px_#000000] max-w-lg w-full">
            <div className="space-y-8">
              {/* Title with Pink Icon - LEFT ALIGNED */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <TargetIcon className="w-10 h-10 text-[#E5B6E5] flex-shrink-0" />
                  <h1 className="text-3xl font-black uppercase tracking-wider text-black">
                    Deep Focus Session
                  </h1>
                </div>
              </div>

              {/* Project Selection */}
              <div>
                <label className="text-lg font-black uppercase tracking-wider text-black mb-4 block">
                  What are you working on?
                </label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000] font-black uppercase tracking-wider text-black focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 h-12 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000000]">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000]">
                    {activeProjects.map((project) => (
                      <SelectItem 
                        key={project.id} 
                        value={project.id.toString()} 
                        className="font-black uppercase tracking-wider hover:bg-[#CFE820]/20"
                      >
                        {project.title}
                        {project.isBossBattle && ' ★'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="text-lg font-black uppercase tracking-wider text-black mb-4 block">
                  For how long?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([60, 90, 120] as const).map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSessionDuration(duration)}
                      className={`p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 text-center font-black uppercase tracking-wider ${
                        sessionDuration === duration ? 'bg-[#E5B6E5] text-black' : 'bg-white text-black'
                      }`}
                    >
                      <div className="text-lg mb-1">{duration}</div>
                      <div className="text-xs">min</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startSession}
                disabled={!selectedProject}
                className="w-full bg-[#E5B6E5] text-black border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[#E5B6E5]/90 transition-all duration-200 hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[7px_7px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 inline mr-3" />
                Start Deep Focus
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionState === 'willpower' && (
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-black uppercase tracking-wider mb-8 text-[#E5B6E5]">WILLPOWER CHECK</h1>
          
          <div className="space-y-6">
            {willpowerOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setWillpowerLevel(option.value)}
                  className={`w-full p-6 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-[#CFE820] hover:bg-[#CFE820]/90 ${
                    willpowerLevel === option.value ? 'ring-4 ring-[#E5B6E5]' : ''
                  }`}
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-3 text-[#224718] fill-[#224718]" />
                  <div className="text-xl font-black uppercase tracking-wider text-black">{option.label}</div>
                  <div className="text-sm font-bold uppercase tracking-wide text-black/70">{option.sublabel}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <button
              onClick={confirmWillpower}
              disabled={!willpowerLevel}
              className="bg-[#224718] text-white border-4 border-black font-black uppercase tracking-wider px-12 py-4 hover:bg-[#224718]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CONFIRM & START
            </button>
          </div>
        </div>
      )}

      {sessionState === 'active' && (
        <div className="max-w-3xl mx-auto text-center">
          {/* Large Timer */}
          <div className="bg-[#E5EED0] border-4 border-black p-12 shadow-[4px_4px_0px_#000000] mb-8">
            <div 
              className={`text-8xl font-black font-mono text-[#224718] mb-4 ${timeRemaining <= 300 ? 'urgent-pulse' : ''}`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-2xl font-black uppercase tracking-wider text-[#E5B6E5]">
              DIFFICULTY LEVEL: {getDifficultyQuote()}
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white border-4 border-black p-8 shadow-[4px_4px_0px_#000000] mb-8">
            <div className="text-2xl font-black uppercase tracking-wider text-[#E5B6E5] mb-2">
              WORKING MINDFULLY AND MONOTASKING ON:
            </div>
            <div className="text-3xl font-black uppercase tracking-wider text-[#224718]">
              {getSelectedProjectTitle()}
            </div>
          </div>

          {/* Interrupt Button */}
          <button
            onClick={interruptSession}
            className="bg-red-600 text-white border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-red-700 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
          >
            <Square className="w-5 h-5 inline mr-3" />
            INTERRUPT SESSION
          </button>
        </div>
      )}

      {sessionState === 'completed' && (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#CFE820] border-4 border-black p-8 shadow-[4px_4px_0px_#000000] mb-8">
            <div className="text-4xl font-black uppercase tracking-wider text-black mb-4">
              SESSION COMPLETED! 🎉
            </div>
            <div className="text-xl font-bold uppercase tracking-wide text-black/70">
              {sessionDuration} MINUTES OF DEEP WORK
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] mb-8">
            <div className="text-xl font-black uppercase tracking-wider text-[#E5B6E5] mb-6">
              WERE YOU IN THE ZONE?
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => completeSession('excellent')}
                className="w-full p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-[#CFE820] hover:bg-[#CFE820]/90"
              >
                <div className="text-lg font-black uppercase tracking-wider text-black">SHAOLIN</div>
                <div className="text-sm font-bold uppercase tracking-wide text-black/70">EXCELLENT FOCUS</div>
              </button>

              <button
                onClick={() => completeSession('good')}
                className="w-full p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-[#E5EED0] hover:bg-[#E5EED0]/90"
              >
                <div className="text-lg font-black uppercase tracking-wider text-black">GETTING THERE</div>
                <div className="text-sm font-bold uppercase tracking-wide text-black/70">GOOD PROGRESS</div>
              </button>

              <button
                onClick={() => completeSession('challenging')}
                className="w-full p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-white hover:bg-white/90"
              >
                <div className="text-lg font-black uppercase tracking-wider text-black">WHAT THE HECK IS THE ZONE?</div>
                <div className="text-sm font-bold uppercase tracking-wide text-black/70">CHALLENGING SESSION</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionState === 'interrupted' && (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-100 border-4 border-black p-8 shadow-[4px_4px_0px_#000000] mb-8">
            <div className="text-3xl font-black uppercase tracking-wider text-black mb-4">
              SESSION INTERRUPTED
            </div>
            <div className="text-lg font-bold uppercase tracking-wide text-black/70 mb-6">
              MINIMAL XP AWARDED (1 POINT)
            </div>
            
            <button
              onClick={() => setSessionState('setup')}
              className="bg-[#224718] text-white border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[#224718]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
            >
              RETURN TO SETUP
            </button>
          </div>
        </div>
      )}
    </main>
  );
}