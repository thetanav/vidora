export const VideoInfo = ({ id }: { id: string }) => {
  return (
    <div className="mt-4 mb-2">
      <h3 className="text-2xl font-bold">Darshan Rawal in CGC LANDRAN</h3>
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2 items-center">
          <img src="/per1.png" className="w-10 h-10 rounded-full" />
          <div>
            <h3 className="font-semibold">Tanav Poswal</h3>
            <p className="text-sm opacity-70 -mt-1">12.3 M subscribers</p>
          </div>
        </div>

        <div className="flex gap-3 mr-4">
          <button>👍 123</button>
          <button>👎 2</button>
          <button>🔗</button>
        </div>
      </div>
    </div>
  );
};
