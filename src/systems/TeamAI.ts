// Role-based 7v7: 1 GK + 2 DF + 3 MF + 1 ST. Team FSM Attack/Defend, player FSM Chase/Support/Home.
export type Role = 'GK' | 'DF' | 'MF' | 'ST';
export interface Slot { role: Role; home: { x: number; y: number }; atkShift: { x: number; y: number } }
export const PITCH = { W: 1050, H: 680 };
export function formationSlots(attackUp: boolean): Slot[] {
  const s = (attackUp: boolean, x: number, y: number): { x: number; y: number } => ({ x, y: attackUp ? 680 - y : y });
  return [
    { role: 'GK', home: s(attackUp, 525, 40), atkShift: { x: 0, y: 0 } },
    { role: 'DF', home: s(attackUp, 350, 180), atkShift: { x: 0, y: attackUp ? -60 : 60 } },
    { role: 'DF', home: s(attackUp, 700, 180), atkShift: { x: 0, y: attackUp ? -60 : 60 } },
    { role: 'MF', home: s(attackUp, 300, 340), atkShift: { x: 0, y: attackUp ? -80 : 80 } },
    { role: 'MF', home: s(attackUp, 525, 360), atkShift: { x: 0, y: attackUp ? -80 : 80 } },
    { role: 'MF', home: s(attackUp, 750, 340), atkShift: { x: 0, y: attackUp ? -80 : 80 } },
    { role: 'ST', home: s(attackUp, 525, 500), atkShift: { x: 0, y: attackUp ? -70 : 70 } },
  ];
}
export function isPassSafe(from: { x: number; y: number }, to: { x: number; y: number }, opps: { x: number; y: number }[]): boolean {
  for (const o of opps) {
    const t = Math.max(0, Math.min(1, ((o.x - from.x) * (to.x - from.x) + (o.y - from.y) * (to.y - from.y)) / (Math.hypot(to.x - from.x, to.y - from.y) ** 2 || 1)));
    const d = Math.hypot(o.x - (from.x + (to.x - from.x) * t), o.y - (from.y + (to.y - from.y) * t));
    if (d < 40) return false;
  }
  return true;
}
export function bestSupport(ball: { x: number; y: number }, mates: { x: number; y: number }[], opps: { x: number; y: number }[], goal: { x: number; y: number }): { x: number; y: number } {
  let best = mates[0], bs = -1e9;
  for (let i = 0; i < 25; i++) {
    const c = { x: ball.x + (Math.random() - 0.5) * 400, y: ball.y + (Math.random() - 0.5) * 400 };
    c.x = Math.max(40, Math.min(PITCH.W - 40, c.x)); c.y = Math.max(40, Math.min(PITCH.H - 40, c.y));
    let sc = -Math.hypot(c.x - goal.x, c.y - goal.y) * -0.05;
    sc += Math.min(...opps.map((o) => Math.hypot(c.x - o.x, c.y - o.y))) * 1.2;
    sc += Math.min(...mates.map((m) => Math.hypot(c.x - m.x, c.y - m.y))) * 0.3;
    if (sc > bs) { bs = sc; best = c; }
  }
  return best;
}
