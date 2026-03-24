import playerData from '@/data/players.json';
import { DraftBoard } from '@/components/draft-board';

export default function Home() {
  return <DraftBoard positions={playerData.positions} />;
}
