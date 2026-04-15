import Loading from './Loading';

const Fallback = () => {
  return (
    <div className="flex h-screen flex-col max-w-5xl mx-auto">
      <div className="w-full mt-5 px-5">
        <Loading />
      </div>
    </div>
  );
};

export default Fallback;
