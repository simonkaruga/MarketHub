const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} spinner`} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

export default Loading;
