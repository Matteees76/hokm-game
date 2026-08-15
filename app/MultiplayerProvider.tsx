"use client";

import type {
  Card,
} from "@/game/deck";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  io,
  type Socket,
} from "socket.io-client";

type Player = {
  id: string;
  name: string;
  isBot: boolean;
};

export type Room = {
  host: string;

  players: (
    Player | undefined
  )[];
};

export type PrivatePlayedCard = {
  player: number;
  card: Card;
};

export type HokmSuit =
  | "spades"
  | "hearts"
  | "clubs"
  | "diamonds";

type MultiplayerContextType = {
  // =========================
  // SOCKET
  // =========================

  socket:
    Socket | null;

  // =========================
  // ROOM
  // =========================

  roomCode:
    string;

  setRoomCode: (
    code: string
  ) => void;

  room:
    Room | null;

  setRoom: (
    room:
      Room | null
  ) => void;

  // =========================
  // PLAYER INFO
  // =========================

  playerNumber:
    number | null;

  setPlayerNumber: (
    player:
      number | null
  ) => void;

  hakemPlayer:
    number | null;

  setHakemPlayer: (
    player:
      number | null
  ) => void;

  // =========================
  // HOKM
  // =========================

  hokm:
    HokmSuit | null;

  setHokm: (
    suit:
      HokmSuit | null
  ) => void;

  // =========================
  // PRIVATE HAND
  // =========================

  privateHand:
    Card[];

  setPrivateHand: (
    hand:
      Card[]
  ) => void;

  // =========================
  // CURRENT TRICK
  // =========================

  currentTurn:
    number | null;

  setCurrentTurn: (
    player:
      number | null
  ) => void;

  playedCards:
    PrivatePlayedCard[];

  setPlayedCards: (
    cards:
      PrivatePlayedCard[]
  ) => void;

  trickWinner:
    number | null;

  setTrickWinner: (
    player:
      number | null
  ) => void;

  // =========================
  // TRICK SCORES
  // =========================

  team1Tricks:
    number;

  setTeam1Tricks: (
    score:
      number
  ) => void;

  team2Tricks:
    number;

  setTeam2Tricks: (
    score:
      number
  ) => void;

  // =========================
  // HAND SCORES
  // =========================

  team1Hands:
    number;

  setTeam1Hands: (
    score:
      number
  ) => void;

  team2Hands:
    number;

  setTeam2Hands: (
    score:
      number
  ) => void;

  handWinner:
    1 | 2 | null;

  setHandWinner: (
    winner:
      1 | 2 | null
  ) => void;

  // =========================
  // MATCH WINNER
  // =========================

  matchWinner:
    1 | 2 | null;

  setMatchWinner: (
    winner:
      1 | 2 | null
  ) => void;
};

const MultiplayerContext =
  createContext<
    MultiplayerContextType
      | undefined
  >(undefined);

export function MultiplayerProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  // =========================
  // SOCKET
  // =========================

  const [
    socket,
    setSocket,
  ] =
    useState<
      Socket | null
    >(null);

  // =========================
  // ROOM
  // =========================

  const [
    roomCode,
    setRoomCode,
  ] =
    useState("");

  const [
    room,
    setRoom,
  ] =
    useState<
      Room | null
    >(null);

  // =========================
  // PLAYER INFO
  // =========================

  const [
    playerNumber,
    setPlayerNumber,
  ] =
    useState<
      number | null
    >(null);

  const [
    hakemPlayer,
    setHakemPlayer,
  ] =
    useState<
      number | null
    >(null);

  // =========================
  // HOKM
  // =========================

  const [
    hokm,
    setHokm,
  ] =
    useState<
      HokmSuit | null
    >(null);

  // =========================
  // PRIVATE HAND
  // =========================

  const [
    privateHand,
    setPrivateHand,
  ] =
    useState<Card[]>([]);

  // =========================
  // CURRENT TRICK
  // =========================

  const [
    currentTurn,
    setCurrentTurn,
  ] =
    useState<
      number | null
    >(null);

  const [
    playedCards,
    setPlayedCards,
  ] =
    useState<
      PrivatePlayedCard[]
    >([]);

  const [
    trickWinner,
    setTrickWinner,
  ] =
    useState<
      number | null
    >(null);

  // =========================
  // TRICK SCORES
  // =========================

  const [
    team1Tricks,
    setTeam1Tricks,
  ] =
    useState(0);

  const [
    team2Tricks,
    setTeam2Tricks,
  ] =
    useState(0);

  // =========================
  // HAND SCORES
  // =========================

  const [
    team1Hands,
    setTeam1Hands,
  ] =
    useState(0);

  const [
    team2Hands,
    setTeam2Hands,
  ] =
    useState(0);

  const [
    handWinner,
    setHandWinner,
  ] =
    useState<
      1 | 2 | null
    >(null);

  // =========================
  // MATCH WINNER
  // =========================

  const [
    matchWinner,
    setMatchWinner,
  ] =
    useState<
      1 | 2 | null
    >(null);

  // =========================
  // SOCKET CONNECTION
  // =========================

  useEffect(() => {
  const multiplayerServerUrl =
  process.env
    .NEXT_PUBLIC_MULTIPLAYER_URL ||
  "http://localhost:3001";

const newSocket =
  io(
    multiplayerServerUrl
  );

    setSocket(
      newSocket
    );

    newSocket.on(
      "connect",
      () => {
        console.log(
          "Connected to multiplayer server:",
          newSocket.id
        );
      }
    );

    newSocket.on(
      "room-updated",
      (
        updatedRoom:
          Room
      ) => {
        setRoom(
          updatedRoom
        );
      }
    );

    newSocket.on(
      "connect_error",
      error => {
        console.error(
          "Multiplayer connection error:",
          error.message
        );
      }
    );

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // =========================
  // PROVIDER
  // =========================

  return (
    <MultiplayerContext.Provider
      value={{
        socket,

        roomCode,
        setRoomCode,

        room,
        setRoom,

        playerNumber,
        setPlayerNumber,

        hakemPlayer,
        setHakemPlayer,

        hokm,
        setHokm,

        privateHand,
        setPrivateHand,

        currentTurn,
        setCurrentTurn,

        playedCards,
        setPlayedCards,

        trickWinner,
        setTrickWinner,

        team1Tricks,
        setTeam1Tricks,

        team2Tricks,
        setTeam2Tricks,

        team1Hands,
        setTeam1Hands,

        team2Hands,
        setTeam2Hands,

        handWinner,
        setHandWinner,

        matchWinner,
        setMatchWinner,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context =
    useContext(
      MultiplayerContext
    );

  if (!context) {
    throw new Error(
      "useMultiplayer must be used inside MultiplayerProvider"
    );
  }

  return context;
}