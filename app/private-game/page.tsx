"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import type {
  Card as CardType,
} from "@/game/deck";

import {
  useMultiplayer,
} from "../MultiplayerProvider";

export default function PrivateGamePage() {
  const router =
    useRouter();

  const {
    socket,

    roomCode,
    setRoomCode,

    room,

    setPlayerNumber,
    setHakemPlayer,
    setPrivateHand,
  } = useMultiplayer();

  // =========================
  // PLAYER NAME
  // =========================

  const [
    playerName,
    setPlayerName,
  ] =
    useState("");

  // =========================
  // SEAT SWAPPING
  // =========================

  const [
    selectedSeat,
    setSelectedSeat,
  ] =
    useState<number | null>(
      null
    );

  // =========================
  // JOIN ROOM
  // =========================

  const [
    joinCode,
    setJoinCode,
  ] =
    useState("");

  const [
    joinError,
    setJoinError,
  ] =
    useState("");

  // =========================
  // SOCKET EVENTS
  // =========================

  useEffect(() => {
    if (!socket) {
      return;
    }

    /*
      The server confirms that
      everyone in the room is
      entering the game.

      We don't navigate here yet.

      We wait for "game-started"
      because that contains this
      player's own seat number
      and private hand.
    */

    const handleEnterPrivateGame =
      (data: {
        roomCode: string;
      }) => {
        setRoomCode(
          data.roomCode
        );
      };

    // =========================
    // ROOM CREATED
    // =========================

    const handleRoomCreated =
      (code: string) => {
        setRoomCode(
          code
        );

        setJoinError("");
      };

    // =========================
    // JOIN ERROR
    // =========================

    const handleJoinError =
      (message: string) => {
        setJoinError(
          message
        );
      };

    // =========================
    // GAME STARTED
    // =========================

    /*
      This event is personalized
      for each human player.
    */

    const handleGameStarted =
      (data: {
        playerNumber: number;
        hakemPlayer: number;
        roomCode: string;
        hand: CardType[];
      }) => {
        setPlayerNumber(
          data.playerNumber
        );

        setHakemPlayer(
          data.hakemPlayer
        );

        setRoomCode(
          data.roomCode
        );

        setPrivateHand(
          data.hand
        );

        /*
          Only navigate once
          this player's own
          game data is ready.
        */

        router.push(
          "/game/private"
        );
      };

    // =========================
    // LISTENERS
    // =========================

    socket.on(
      "enter-private-game",
      handleEnterPrivateGame
    );

    socket.on(
      "room-created",
      handleRoomCreated
    );

    socket.on(
      "join-error",
      handleJoinError
    );

    socket.on(
      "game-started",
      handleGameStarted
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {
      socket.off(
        "enter-private-game",
        handleEnterPrivateGame
      );

      socket.off(
        "room-created",
        handleRoomCreated
      );

      socket.off(
        "join-error",
        handleJoinError
      );

      socket.off(
        "game-started",
        handleGameStarted
      );
    };
  }, [
    socket,
    router,

    setRoomCode,
    setPlayerNumber,
    setHakemPlayer,
    setPrivateHand,
  ]);

  // =========================
  // HOST STATUS
  // =========================

  const isHost =
    Boolean(
      socket &&
      room &&
      socket.id ===
        room.host
    );

  // =========================
  // SELECT SEAT TO SWAP
  // =========================

  function selectSeatForSwap(
    index: number
  ) {
    if (
      !socket ||
      !room ||
      !isHost
    ) {
      return;
    }

    const player =
      room.players[index];

    if (!player) {
      return;
    }

    /*
      First occupied seat:
      select it.
    */

    if (
      selectedSeat ===
      null
    ) {
      setSelectedSeat(
        index
      );

      return;
    }

    /*
      Clicking the same seat
      again cancels.
    */

    if (
      selectedSeat ===
      index
    ) {
      setSelectedSeat(
        null
      );

      return;
    }

    /*
      Second occupied seat:
      swap the two players.
    */

    socket.emit(
      "swap-seats",
      {
        roomCode,

        firstIndex:
          selectedSeat,

        secondIndex:
          index,
      }
    );

    setSelectedSeat(
      null
    );
  }

  // =========================
  // CREATE ROOM
  // =========================

  function createRoom() {
    if (!socket) {
      return;
    }

    const name =
      playerName
        .trim();

    if (!name) {
      setJoinError(
        "Please enter your name."
      );

      return;
    }

    setJoinError("");

    socket.emit(
      "create-room",
      {
        name,
      }
    );
  }

  // =========================
  // JOIN ROOM
  // =========================

  function joinRoom() {
    if (!socket) {
      return;
    }

    const name =
      playerName
        .trim();

    const code =
      joinCode
        .trim()
        .toUpperCase();

    if (!name) {
      setJoinError(
        "Please enter your name."
      );

      return;
    }

    if (!code) {
      setJoinError(
        "Please enter a room code."
      );

      return;
    }

    setJoinError("");

    socket.emit(
      "join-room",
      {
        roomCode:
          code,

        name,
      }
    );

    setRoomCode(
      code
    );
  }

  // =========================
  // ADD BOT
  // =========================

  function addBot(
    index: number
  ) {
    if (
      !socket ||
      !room ||
      socket.id !==
        room.host
    ) {
      return;
    }

    socket.emit(
      "add-bot",
      {
        roomCode,
        seatIndex:
          index,
      }
    );
  }

  // =========================
  // REMOVE BOT
  // =========================

  function removeBot(
    index: number
  ) {
    if (
      !socket ||
      !room ||
      socket.id !==
        room.host
    ) {
      return;
    }

    socket.emit(
      "remove-bot",
      {
        roomCode,
        seatIndex:
          index,
      }
    );
  }

  // =========================
  // LOBBY FULL
  // =========================

  const lobbyFull =
    room
      ? [0, 1, 2, 3].every(
          index =>
            Boolean(
              room.players[
                index
              ]
            )
        )
      : false;

  // =========================
  // START GAME
  // =========================

  function startGame() {
    if (
      !socket ||
      !room ||
      !isHost ||
      !lobbyFull
    ) {
      return;
    }

    socket.emit(
      "start-game",
      roomCode
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="privateLobbyPage">

      {/* =====================
          HEADER
      ====================== */}

      <div className="privateLobbyHeader">

        <Link
          href="/"
          className="backButton"
        >
          ← Back
        </Link>

        <div>

          <h1>
            Private Game
          </h1>

          <p>
            Invite friends or
            fill empty seats
            with bots.
          </p>

        </div>

      </div>


      {/* =====================
          CREATE OR JOIN
      ====================== */}

      {!room && (
        <div className="privateLobbyPanel">

          {/* PLAYER NAME */}

          <div className="joinRoomArea">

            <span>
              Choose your name
            </span>

            <input
              type="text"
              value={
                playerName
              }
              maxLength={16}
              placeholder="YOUR NAME"
              autoComplete="off"
              onChange={
                event => {
                  setPlayerName(
                    event.target.value
                  );

                  if (
                    joinError
                  ) {
                    setJoinError("");
                  }
                }
              }
            />

          </div>


          {/* CREATE ROOM */}

          <button
            className="startPrivateGameButton"
            onClick={
              createRoom
            }
          >
            Create Private Game
          </button>


          {/* JOIN ROOM */}

          <div className="joinRoomArea">

            <span>
              Or join an
              existing game
            </span>

            <input
              type="text"
              value={
                joinCode
              }
              maxLength={5}
              placeholder="ROOM CODE"
              autoComplete="off"
              onChange={
                event => {
                  setJoinCode(
                    event.target.value
                  );

                  if (
                    joinError
                  ) {
                    setJoinError("");
                  }
                }
              }
            />

            <button
              className="addBotButton"
              onClick={
                joinRoom
              }
            >
              Join Game
            </button>

          </div>


          {/* ERROR */}

          {joinError && (
            <p className="joinError">
              {joinError}
            </p>
          )}

        </div>
      )}


      {/* =====================
          PRIVATE LOBBY
      ====================== */}

      {room && (
        <div className="privateLobbyPanel">

          {/* ROOM CODE */}

          <div className="roomCodeArea">

            <span>
              Room Code
            </span>

            <strong>
              {roomCode}
            </strong>

            <p>
              Share this code
              with your friends.
            </p>

          </div>


          {/* TEAM INFORMATION */}

          <div className="privateTeamInfo">

            <span>
              Team 1:
              Players 1 + 3
            </span>

            <span>
              Team 2:
              Players 2 + 4
            </span>

          </div>


          {/* HOST SWAP HINT */}

          {isHost && (
            <p className="lobbyHint">
              Click two occupied
              seats to swap players
              between teams.
            </p>
          )}


          {/* =====================
              LOBBY SEATS
          ====================== */}

          <div className="lobbySeats">

            {[0, 1, 2, 3].map(
              index => {
                const player =
                  room.players[
                    index
                  ];

                return (
                  <div
                    className={`lobbySeat ${
                      selectedSeat ===
                      index
                        ? "selectedLobbySeat"
                        : ""
                    } ${
                      isHost &&
                      player
                        ? "swappableLobbySeat"
                        : ""
                    }`}
                    key={
                      index
                    }
                    onClick={() => {
                      if (
                        isHost &&
                        player
                      ) {
                        selectSeatForSwap(
                          index
                        );
                      }
                    }}
                  >

                    {/* PLAYER DETAILS */}

                    <div className="seatInfo">

                      <span className="seatNumber">
                        Player{" "}
                        {index + 1}
                      </span>

                      <strong>
                        {player
                          ? player.id ===
                            socket?.id
                            ? `${player.name} (You)`
                            : player.name
                          : "Empty"}
                      </strong>

                      <span className="seatTeam">
                        {index === 0 ||
                        index === 2
                          ? "Team 1"
                          : "Team 2"}
                      </span>

                    </div>


                    {/* OCCUPIED SEAT */}

                    {player ? (

                      player.isBot ? (

                        // BOT

                        isHost ? (
                          <button
                            className="removeBotButton"
                            onClick={
                              event => {
                                event.stopPropagation();

                                removeBot(
                                  index
                                );
                              }
                            }
                          >
                            Remove Bot
                          </button>
                        ) : (
                          <span className="hostBadge">
                            Bot
                          </span>
                        )

                      ) : player.id ===
                        room.host ? (

                        // HOST

                        <span className="hostBadge">
                          Host
                        </span>

                      ) : (

                        // HUMAN PLAYER

                        <span className="hostBadge">
                          Player
                        </span>

                      )

                    ) : (

                      // EMPTY SEAT

                      isHost ? (
                        <button
                          className="addBotButton"
                          onClick={
                            event => {
                              event.stopPropagation();

                              addBot(
                                index
                              );
                            }
                          }
                        >
                          Add Bot
                        </button>
                      ) : (
                        <span className="hostBadge">
                          Empty
                        </span>
                      )

                    )}

                  </div>
                );
              }
            )}

          </div>


          {/* =====================
              START BUTTON
          ====================== */}

          {isHost ? (

            <button
              className="startPrivateGameButton"
              disabled={
                !lobbyFull
              }
              onClick={
                startGame
              }
            >
              Start Game
            </button>

          ) : (

            <button
              className="startPrivateGameButton"
              disabled
            >
              Waiting for Host
            </button>

          )}


          {/* LOBBY NOT FULL */}

          {!lobbyFull && (
            <p className="lobbyHint">
              All four seats
              must be filled
              before the game
              can begin.
            </p>
          )}

        </div>
      )}


      {!room && (
        <section className="multiplayerSeoSection">

          <h2>
            Play Hokm Online With Friends
          </h2>

          <p>
            Create a private Hokm game and play the
            classic Persian card game online with
            friends. Create a room, share the room
            code and let other players join from
            their own browser.
          </p>

          <p>
            Private Hokm games are played with four
            players in two teams. If you do not have
            four people, the host can fill empty seats
            with computer-controlled bots before
            starting the game.
          </p>

          <p>
            If you are new to Hokm, read our{" "}
            <Link href="/how-to-play">
              complete Hokm rules and how-to-play guide
            </Link>{" "}
            to learn about the Hâkem, trump suit,
            tricks and scoring.
          </p>

        </section>
      )}

    </main>
  );
}