import Player from "./player";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="App">
      <h1>Video Player</h1>
      <p>{id}</p>
      <Player id={id} />
    </div>
  );
}
