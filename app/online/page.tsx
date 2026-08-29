"use client";

import Link from "next/link";


import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useMultiplayer,
} from "../MultiplayerProvider";

import type {
  Card as CardType,
} from "@/game/deck";

type OnlinePlayer = {
  id: string;
  name: string;
  isBot: boolean;
};

export default function OnlinePage() {
  const router =
    useRouter();

  const {
    socket,

    setRoomCode,
    setRoom,

    setPlayerNumber,
    setHakemPlayer,
    setPrivateHand,
  } = useMultiplayer();

  const [
    playerName,
    setPlayerName,
  ] =
    useState("");

  const [
    searching,
    setSearching,
  ] =
    useState(false);

  const [
    playersWaiting,
    setPlayersWaiting,
  ] =
    useState(0);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    if (!socket) {
      return;
    }

    // =========================
    // QUEUE UPDATE
    // =========================

    const handleQueueUpdate =
      (data: {
        position: number;
        playersWaiting: number;
      }) => {
        setSearching(
          true
        );

        setPlayersWaiting(
          data.playersWaiting
        );
      };

    // =========================
    // GLOBAL QUEUE COUNT
    // =========================

    const handleQueueCount =
      (
        count: number
      ) => {
        setPlayersWaiting(
          count
        );
      };

    // =========================
    // ONLINE ERROR
    // =========================

    const handleOnlineError =
      (
        message: string
      ) => {
        setError(
          message
        );

        setSearching(
          false
        );
      };

    // =========================
    // MATCH FOUND
    // =========================

    const handleOnlineGameStarted =
      (data: {
        roomCode: string;

        playerNumber: number;

        hakemPlayer: number;

        hand: CardType[];

        phase: string;

        players: OnlinePlayer[];
      }) => {
        setRoomCode(
          data.roomCode
        );

        /*
          The private game page
          expects a Room object.

          Online matchmaking has
          no host, so we use an
          empty string for host.
        */

        setRoom({
          host: "",
          players:
            data.players,
        });

        setPlayerNumber(
          data.playerNumber
        );

        setHakemPlayer(
          data.hakemPlayer
        );

        setPrivateHand(
          data.hand
        );

        setSearching(
          false
        );

        router.push(
          "/game/private"
        );
      };

    // =========================
    // SOCKET LISTENERS
    // =========================

    socket.on(
      "online-queue-update",
      handleQueueUpdate
    );

    socket.on(
      "online-queue-count",
      handleQueueCount
    );

    socket.on(
      "online-error",
      handleOnlineError
    );

    socket.on(
      "online-game-started",
      handleOnlineGameStarted
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {
      socket.off(
        "online-queue-update",
        handleQueueUpdate
      );

      socket.off(
        "online-queue-count",
        handleQueueCount
      );

      socket.off(
        "online-error",
        handleOnlineError
      );

      socket.off(
        "online-game-started",
        handleOnlineGameStarted
      );
    };
  }, [
    socket,
    router,

    setRoomCode,
    setRoom,

    setPlayerNumber,
    setHakemPlayer,
    setPrivateHand,
  ]);

  // =========================
  // FIND MATCH
  // =========================

  function findMatch() {
    if (!socket) {
      return;
    }

    const name =
      playerName
        .trim();

    if (!name) {
      setError(
        "Please enter your name."
      );

      return;
    }

    setError("");

    setSearching(
      true
    );

    socket.emit(
      "join-online",
      {
        name,
      }
    );
  }

  // =========================
  // CANCEL SEARCH
  // =========================

  function cancelSearch() {
    if (!socket) {
      return;
    }

    socket.emit(
      "leave-online"
    );

    setSearching(
      false
    );

    setPlayersWaiting(
      0
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="onlinePage">

      <div className="onlinePanel">

        <h1>
          Online Match
        </h1>

        {!searching ? (
          <>

            <p>
              Enter your name
              and find other
              players online.
            </p>

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
                    error
                  ) {
                    setError("");
                  }
                }
              }
            />

            <button
              className="onlineFindMatchButton"
              onClick={
                findMatch
              }
            >
              Find Match
            </button>

            {error && (
              <p className="joinError">
                {error}
              </p>
            )}

          </>
        ) : (
          <>

            <div className="onlineSearching">

              <div className="onlineSpinner" />

              <h2>
                Searching for players...
              </h2>

              <p>
                {Math.min(
                  playersWaiting,
                  4
                )}
                {" / "}
                4 players found
              </p>

            </div>

            <button
              className="onlineCancelButton"
              onClick={
                cancelSearch
              }
            >
              Cancel
            </button>

          </>
        )}

       </div>


      {!searching && (
        <section className="multiplayerSeoSection">

          <h2>
            Play Hokm Online
          </h2>

          <p>
            Play Hokm online against other players
            directly in your browser. Enter your name,
            join matchmaking and wait for four players
            to be found before the match begins.
          </p>

          <p>
            Hokm is a traditional Persian card game
            played by four players in two teams. Work
            with your teammate, follow suit and use the
            Hokm trump suit to compete for tricks and
            win the match.
          </p>

          <p>
            Never played before? Read our{" "}
            <Link href="/how-to-play">
              guide to the rules of Hokm
            </Link>{" "}
            before joining an online match.
          </p>

        </section>
      )}

    </main>
  );
}