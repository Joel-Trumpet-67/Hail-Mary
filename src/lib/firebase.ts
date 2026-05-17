import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDrql0zM8iUQlcILo04ELWywEP5MWJTns8',
  authDomain: 'hail-mary-a9e91.firebaseapp.com',
  projectId: 'hail-mary-a9e91',
  storageBucket: 'hail-mary-a9e91.firebasestorage.app',
  messagingSenderId: '806569182320',
  appId: '1:806569182320:web:912a79f676504b610fe0b5',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

function generateCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createLeague(name: string, createdBy: string) {
  const inviteCode = generateCode(6)
  const id = generateCode(12)
  const league = {
    id,
    name,
    inviteCode,
    createdBy,
    phase: 'picks',
    createdAt: new Date().toISOString(),
  }
  await setDoc(doc(db, 'leagues', id), league)
  return league
}

export async function getLeagueByCode(inviteCode: string) {
  const q = query(collection(db, 'leagues'), where('inviteCode', '==', inviteCode.toUpperCase()))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('League not found')
  return snap.docs[0].data()
}

export async function joinLeague(leagueId: string, playerName: string) {
  const sessionToken = generateCode(16)
  const id = generateCode(12)
  const player = {
    id,
    name: playerName,
    leagueId,
    sessionToken,
    joinedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, 'players', id), player)
  return player
}

export async function getLeaguePlayers(leagueId: string) {
  const q = query(collection(db, 'players'), where('leagueId', '==', leagueId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}

export async function savePick(
  playerId: string,
  leagueId: string,
  gameId: string,
  teamId: string,
  pick: 'W' | 'L'
) {
  const id = `${playerId}_${gameId}_${teamId}`
  await setDoc(doc(db, 'picks', id), {
    playerId,
    leagueId,
    gameId,
    teamId,
    pick,
    updatedAt: new Date().toISOString(),
  })
}

export async function getPlayerPicks(playerId: string, leagueId: string) {
  const q = query(
    collection(db, 'picks'),
    where('playerId', '==', playerId),
    where('leagueId', '==', leagueId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}

export async function getAllLeaguePicks(leagueId: string) {
  const q = query(collection(db, 'picks'), where('leagueId', '==', leagueId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}

export async function savePlayoffPick(
  playerId: string,
  leagueId: string,
  gameId: string,
  pickedTeamId: string
) {
  const id = `${playerId}_${gameId}`
  await setDoc(doc(db, 'playoffPicks', id), {
    playerId,
    leagueId,
    gameId,
    pickedTeamId,
    updatedAt: new Date().toISOString(),
  })
}

export function subscribeToLeague(leagueId: string, callback: () => void) {
  const q = query(collection(db, 'picks'), where('leagueId', '==', leagueId))
  const unsub = onSnapshot(q, callback)
  return { unsubscribe: unsub }
}