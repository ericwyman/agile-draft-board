import playerData from '@/data/players.json';

const POSITION_ORDER = ['C', '1B', '2B', 'SS', '3B', 'OF', 'DH', 'SP', 'RP'] as const;

type Player = {
  name: string;
  team?: string;
  war?: number;
  adp?: number;
  subPosition?: string;
};

export default function Home() {
  const positions = playerData.positions as Record<string, Player[]>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agile Draft Board</h1>

      <div className="space-y-4">
        {POSITION_ORDER.map((pos) => {
          const players = positions[pos] || [];
          return (
            <div key={pos} className="flex gap-3 items-start">
              <div className="w-12 shrink-0 py-2 text-center font-bold text-sm bg-gray-800 rounded">
                {pos}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {players.slice(0, 20).map((player, i) => (
                  <div
                    key={`${player.name}-${i}`}
                    className="shrink-0 w-36 rounded-lg border border-gray-700 bg-gray-900 p-2 text-xs"
                  >
                    <div className="font-semibold truncate">{player.name}</div>
                    <div className="text-gray-400 flex justify-between mt-1">
                      <span>{player.team}</span>
                      {player.subPosition && (
                        <span className="bg-blue-900 text-blue-300 px-1 rounded text-[10px]">
                          {player.subPosition}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {player.war !== undefined && `WAR ${player.war}`}
                      {player.adp !== undefined && `ADP ${player.adp}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
