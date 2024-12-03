export function LoadingSpinner() {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute w-full h-3 bg-amber-400 rounded-t-xl animate-bounce-slow" style={{ animationDelay: '0.1s' }} />
      <div className="absolute w-full h-1.5 bg-green-500 top-4 animate-bounce-slow" style={{ animationDelay: '0.2s' }} />
      <div className="absolute w-full h-2 bg-red-500 top-6 animate-bounce-slow" style={{ animationDelay: '0.3s' }} />
      <div className="absolute w-full h-2 bg-yellow-300 top-8 animate-bounce-slow" style={{ animationDelay: '0.4s' }} />
      <div className="absolute w-full h-2.5 bg-amber-700 top-10 animate-bounce-slow" style={{ animationDelay: '0.5s' }} />
      <div className="absolute w-full h-3 bg-amber-400 bottom-0 rounded-b-xl animate-bounce-slow" style={{ animationDelay: '0.6s' }} />
    </div>
  );
}
