import { useEffect, useState } from "react";

const FloatingElement = ({ delay, duration, size, left, top, color }) => (
  <div
    className="absolute rounded-full opacity-20 blur-xl animate-float"
    style={{
      left,
      top,
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

const CodeSymbol = ({ symbol, delay, left, top }) => (
  <div
    className="absolute text-4xl font-mono font-bold opacity-5 dark:opacity-10 animate-float-slow"
    style={{
      left,
      top,
      animationDelay: `${delay}s`,
    }}
  >
    {symbol}
  </div>
);

const AnimatedBackground = ({ variant = "home" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const codeSymbols = ["{}", "[]", "</>", "( )", "=>", "&&", "||", "?", "!", "#"];

  const randomSymbols = Array.from({ length: 15 }, () => ({
    symbol: codeSymbols[Math.floor(Math.random() * codeSymbols.length)],
    delay: Math.random() * 10,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }));

  const getColors = () => {
    switch (variant) {
      case "home":
        return [
          "linear-gradient(135deg, #3B82F6, #6366F1)",
          "linear-gradient(135deg, #8B5CF6, #6366F1)",
          "linear-gradient(135deg, #06B6D4, #3B82F6)",
        ];
      case "dashboard":
        return [
          "linear-gradient(135deg, #3B82F6, #6366F1)",
          "linear-gradient(135deg, #10B981, #059669)",
          "linear-gradient(135deg, #8B5CF6, #7C3AED)",
        ];
      case "notes":
        return [
          "linear-gradient(135deg, #10B981, #14B8A6)",
          "linear-gradient(135deg, #06B6D4, #0891B2)",
          "linear-gradient(135deg, #3B82F6, #2563EB)",
        ];
      case "analysis":
        return [
          "linear-gradient(135deg, #8B5CF6, #A78BFA)",
          "linear-gradient(135deg, #EC4899, #DB2777)",
          "linear-gradient(135deg, #F59E0B, #D97706)",
        ];
      default:
        return [
          "linear-gradient(135deg, #3B82F6, #6366F1)",
          "linear-gradient(135deg, #8B5CF6, #6366F1)",
        ];
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-violet-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] animate-grid-flow" />

      {/* Floating blobs */}
      <FloatingElement delay={0} duration={20} size={400} left="10%" top="20%" color={colors[0]} />
      <FloatingElement delay={3} duration={25} size={350} left="70%" top="60%" color={colors[1]} />
      <FloatingElement delay={5} duration={22} size={300} left="50%" top="10%" color={colors[2] || colors[0]} />
      <FloatingElement delay={7} duration={28} size={250} left="20%" top="70%" color={colors[1]} />
      <FloatingElement delay={2} duration={24} size={200} left="80%" top="30%" color={colors[0]} />

      {/* Code symbols */}
      {randomSymbols.map((item, i) => (
        <CodeSymbol
          key={i}
          symbol={item.symbol}
          delay={item.delay}
          left={item.left}
          top={item.top}
        />
      ))}

      {/* Rings */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 border border-blue-500/10 dark:border-blue-400/10 rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 border border-indigo-500/10 dark:border-indigo-400/10 rounded-full animate-pulse-slow animation-delay-2000" />

      {/* SVG lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5 dark:opacity-10">
        <line
          x1="10%"
          y1="20%"
          x2="90%"
          y2="80%"
          stroke="currentColor"
          strokeWidth="1"
          className="animate-draw-line"
        />
        <line
          x1="80%"
          y1="20%"
          x2="20%"
          y2="80%"
          stroke="currentColor"
          strokeWidth="1"
          className="animate-draw-line animation-delay-1000"
        />
      </svg>

      {/* Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 dark:bg-blue-400/30 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;