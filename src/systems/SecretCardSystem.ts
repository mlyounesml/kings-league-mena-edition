export type Card = 'DOUBLE_X2' | 'SUSPEND' | 'PENALTY' | 'SHOOTOUT' | 'JOKER';
export const BALANCE = {
  GLOBAL_CD: 90, CARD_CD: 150, DOUBLE_DUR: 45, SUSPEND_DUR: 30,
  LEAD_BLOCK: 3, WINDOW: [30, 150] as const, PITY: 0.7,
};
export interface TeamCardState {
  drawn: Card; globalReadyAt: number; perCard: Partial<Record<Card, number>>;
  doubleUntil: number; suspendedIds: string[];
}
export function drawCard(bias?: Card): Card {
  const pool: Card[] = ['DOUBLE_X2', 'SUSPEND', 'PENALTY', 'SHOOTOUT', 'JOKER'];
  if (bias && Math.random() < 0.35) return bias;
  return pool[Math.floor(Math.random() * pool.length)];
}
export function canActivate(st: TeamCardState, card: Card, now: number, scoreDiff: number, phase: string, enemyHasCard: boolean, targetIsGK: boolean): boolean {
  if (phase !== 'OPEN_PLAY') return false;
  if (now < BALANCE.WINDOW[0] || now > BALANCE.WINDOW[1]) return false;
  if (now < st.globalReadyAt) return false;
  if (now < (st.perCard[card] ?? 0)) return false;
  if (scoreDiff >= BALANCE.LEAD_BLOCK && (card === 'DOUBLE_X2' || card === 'PENALTY' || card === 'SHOOTOUT')) return false;
  if (card === 'SUSPEND' && targetIsGK) return false;
  if (card === 'JOKER' && !enemyHasCard) return false;
  return true;
}
export function markUsed(st: TeamCardState, card: Card, now: number, losing: boolean) {
  const mult = losing ? BALANCE.PITY : 1;
  st.globalReadyAt = now + BALANCE.GLOBAL_CD * mult;
  st.perCard[card] = now + BALANCE.CARD_CD;
  if (card === 'DOUBLE_X2') st.doubleUntil = now + BALANCE.DOUBLE_DUR;
}
