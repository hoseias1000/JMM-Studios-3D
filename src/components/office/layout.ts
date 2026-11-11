import type { Vec3 } from './primitives';

export const stations: Record<string, { position: Vec3; rotation: number }> = {
  ceo: { position: [15.3, 0, -3.9], rotation: Math.PI },
  producer: { position: [-2.5, 0, -3.1], rotation: 0 },
  writer: { position: [3.8, 0, -3.5], rotation: -Math.PI / 2 },
  visual: { position: [-5.7, 0, 2.7], rotation: 0 },
  editor: { position: [-2.5, 0, 2.7], rotation: 0 },
  reviewer: { position: [3.8, 0, 2.6], rotation: -Math.PI / 2 },
  receptionist: { position: [-1.5, 0, 10.5], rotation: Math.PI },
};
export const sectors = [
  { name: 'DIREÇÃO', number: '01', x: -4.55, z: -3.25, color: '#c4cad3', floor: '#34353b', wood: false },
  { name: 'ROTEIROS', number: '02', x: 4.55, z: -3.25, color: '#c4d3d7', floor: '#30363c', wood: false },
  { name: 'EDIÇÃO', number: '03', x: -4.55, z: 3.25, color: '#a5c5e7', floor: '#282e38', wood: false },
  { name: 'REVISÃO', number: '04', x: 4.55, z: 3.25, color: '#d1c9c0', floor: '#34343c', wood: false },
];

// New front wing. All room coordinates share this plan with the animated agents.
export const amenityRooms = [
  { id: 'meeting', name: 'SALA DE REUNIÃO', number: '05', x: -5.95, z: 11.75, width: 5.8, depth: 7.2, floor: '#39414a', color: '#bbcbd6' },
  { id: 'entrance', name: 'ENTRADA / RECEPÇÃO', number: '06', x: 0, z: 11.75, width: 5.6, depth: 7.2, floor: '#8d8271', color: '#e0d4bd' },
  { id: 'break', name: 'SALA DE DESCANSO', number: '07', x: 5.95, z: 11.75, width: 5.8, depth: 7.2, floor: '#706c60', color: '#d2ceb9' },
];
export const meetingSeats: { position: Vec3; rotation: number }[] = [
  ...Array.from({ length: 6 }, (_, i) => ({
    position: [i < 3 ? -7.55 : -4.35, 0, 10.05 + (i % 3) * 1.6] as Vec3,
    rotation: i < 3 ? -Math.PI / 2 : Math.PI / 2,
  })),
  { position: [-5.95, 0, 14.65], rotation: 0 },
];
export const breakSeats: { position: Vec3; rotation: number }[] = [
  { position: [5.31, 0, 14.35], rotation: 0 },
  { position: [6.69, 0, 14.35], rotation: 0 },
  { position: [8, 0, 11.69], rotation: Math.PI / 2 },
  { position: [8, 0, 10.31], rotation: Math.PI / 2 },
  { position: [4.1, 0, 9.6], rotation: -Math.PI / 2 },
  { position: [4.6, 0, 11.4], rotation: -Math.PI / 2 },
  { position: [6, 0, 14.35], rotation: 0 },
];
export const executiveRoom = { name: 'SALA DA CEO', number: '08', x: 14.45, z: -.2, width: 10.4, depth: 12.7 };
export const officeRoomCount = sectors.length + amenityRooms.length + 1;
export const officeView = { target: [5.25, .7, 5.2] as Vec3, position: [29.25, 28.7, 37.2] as Vec3, projectedWidth: 38, projectedHeight: 27 };

// Door leaves for shared rooms and the marked Editing/Review corridor entrances.
export const roomDoors: { id: string; room: string; position: Vec3; rotation: number; opening?: number }[] = [
  { id: 'ceo-hall', room: 'ceo', position: [9.25, 0, -.6], rotation: -Math.PI / 2, opening: -Math.PI / 3 },
  { id: 'editing-spine', room: 'editing', position: [-.9, 0, 4.7], rotation: -Math.PI / 2, opening: Math.PI / 3 },
  { id: 'review-spine', room: 'review', position: [.9, 0, 5.9], rotation: Math.PI / 2, opening: Math.PI / 3 },
  { id: 'meeting-hall', room: 'meeting', position: [-4.75, 0, 8.15], rotation: 0 },
  { id: 'break-hall', room: 'break', position: [5.35, 0, 8.15], rotation: 0 },
  { id: 'break-reception', room: 'break', position: [2.95, 0, 12.1], rotation: Math.PI / 2 },
  { id: 'entrance-left', room: 'entrance', position: [-1.1, 0, 15.95], rotation: 0 },
  { id: 'entrance-right', room: 'entrance', position: [1.1, 0, 15.95], rotation: Math.PI, opening: -Math.PI / 3 },
];
