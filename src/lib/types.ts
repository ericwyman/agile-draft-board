export type Player = {
  name: string;
  team?: string;
  pa?: number;
  avg?: string;
  obp?: string;
  slg?: string;
  woba?: string;
  war?: number;
  adp?: number;
  subPosition?: string;
};

export type PositionKey =
  | 'C'
  | '1B'
  | '2B'
  | 'SS'
  | '3B'
  | 'OF'
  | 'DH'
  | 'SP'
  | 'RP';

export const POSITION_ORDER: PositionKey[] = [
  'C',
  '1B',
  '2B',
  'SS',
  '3B',
  'OF',
  'DH',
  'SP',
  'RP',
];

export function playerKey(position: string, name: string): string {
  return `${position}::${name}`;
}
