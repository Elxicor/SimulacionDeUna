const Loading = ({ mensaje = 'Cargando...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-600 font-medium">{mensaje}</p>
    </div>
  );
};

export default Loading;
