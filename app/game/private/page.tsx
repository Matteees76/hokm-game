"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Card from "@/components/Card";

import {
  useMultiplayer,

  
} from "../../MultiplayerProvider";



type Suit =
  | "spades"
  | "hearts"
  | "clubs"
  | "diamonds";

export default function PrivateGamePage() {
  const {
    socket,
    roomCode,
    room,

    playerNumber,

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
  } = useMultiplayer();



  
  const [
    isShuffling,
    setIsShuffling,
  ] = useState(false);

  const [
    handIsSorted,
    setHandIsSorted,
  ] = useState(false);

  const [
    collectingCards,
    setCollectingCards,
  ] =
    useState<number | null>(
      null
    );

  /*
    These refs remember the
    previous server update so
    sounds don't play twice.
  */

  const previousPlayedCards =
    useRef(0);

  const previousTrickWinner =
    useRef<number | null>(
      null
    );

  useEffect(() => {
    if (!socket) {
      return;
    }

    // =========================
    // COLLECT TRICK
    // =========================

    const handleCollectTrick =
      (data: {
        winner: number;
      }) => {
        let relativeWinner = 1;

        if (
          playerNumber !== null
        ) {
          relativeWinner =
            (
              (
                data.winner -
                playerNumber +
                4
              ) %
                4
            ) + 1;
        }

        setCollectingCards(
          relativeWinner
        );

        setTimeout(() => {
          setCollectingCards(
            null
          );
        }, 450);
      };

    // =========================
    // HOKM CHOSEN
    // =========================

    const handleHokmChosen =
      (data: {
        suit: Suit;
        hakemPlayer: number;
      }) => {
        setHokm(
          data.suit
        );

        setHakemPlayer(
          data.hakemPlayer
        );

        setIsShuffling(true);

        playSound(
          "/sounds/shuffle.mp3",
          0.6
        );

        setTimeout(() => {
          setIsShuffling(false);
        }, 1400);
      };

    // =========================
    // PRIVATE HAND UPDATE
    // =========================

    const handleHandUpdated =
      (data: {
        hand:
          typeof privateHand;

        currentTurn:
          number | null;

        phase:
          string;
      }) => {
        if (handIsSorted) {
          setPrivateHand(
            getSortedHand(
              data.hand
            )
          );
        } else {
          setPrivateHand(
            data.hand
          );
        }

        setCurrentTurn(
          data.currentTurn
        );
      };

    // =========================
    // SHARED GAME UPDATE
    // =========================

    const handleGameUpdated =
      (data: {
        currentTurn:
          number | null;

        playedCards:
          typeof playedCards;

        trickWinner:
          number | null;

        team1Tricks:
          number;

        team2Tricks:
          number;

        team1Hands:
          number;

        team2Hands:
          number;

        handWinner:
          1 | 2 | null;

        matchWinner:
          1 | 2 | null;
      }) => {
        /*
          CARD PLACEMENT SOUND
        */

        if (
          data.playedCards.length >
          previousPlayedCards.current
        ) {
          playSound(
            "/sounds/card-play.mp3",
            0.55
          );
        }

        setCurrentTurn(
          data.currentTurn
        );

        setPlayedCards(
          data.playedCards
        );

        previousPlayedCards.current =
          data.playedCards.length;

        /*
          TRICK WIN SOUND
        */

        if (
          data.trickWinner !== null &&
          previousTrickWinner.current ===
            null
        ) {
          playSound(
            "/sounds/trick-win.mp3",
            0.6
          );
        }

        setTrickWinner(
          data.trickWinner
        );

        previousTrickWinner.current =
          data.trickWinner;

        /*
          TRICK SCORES
        */

        setTeam1Tricks(
          data.team1Tricks
        );

        setTeam2Tricks(
          data.team2Tricks
        );

        /*
          HAND SCORES
        */

        setTeam1Hands(
          data.team1Hands
        );

        setTeam2Hands(
          data.team2Hands
        );

        /*
          HAND WINNER
        */

        setHandWinner(
          data.handWinner
        );

        /*
          MATCH WINNER
        */

        setMatchWinner(
          data.matchWinner
        );
      };

    // =========================
    // NEW HAND
    // =========================

    const handleNewPrivateHand =
      (data: {
        hand:
          typeof privateHand;

        hakemPlayer:
          number;

        team1Hands:
          number;

        team2Hands:
          number;

        matchWinner?:
          1 | 2 | null;
      }) => {
        /*
          Give this player their
          new starting hand.
        */

        setPrivateHand(
          data.hand
        );

        setHakemPlayer(
          data.hakemPlayer
        );

        /*
          Keep the hand score.
        */

        setTeam1Hands(
          data.team1Hands
        );

        setTeam2Hands(
          data.team2Hands
        );

        if (
          data.matchWinner !==
          undefined
        ) {
          setMatchWinner(
            data.matchWinner
          );
        }

        /*
          Reset everything that
          belongs to the previous hand.
        */

        setHokm(null);

        setCurrentTurn(null);

        setPlayedCards([]);

        setTrickWinner(null);

        setTeam1Tricks(0);
        setTeam2Tricks(0);

        setHandWinner(null);

        setHandIsSorted(false);

        setCollectingCards(null);

        setIsShuffling(false);

        previousPlayedCards.current =
          0;

        previousTrickWinner.current =
          null;
      };

    // =========================
    // SOCKET LISTENERS
    // =========================

    socket.on(
      "hokm-chosen",
      handleHokmChosen
    );

    socket.on(
      "private-hand-updated",
      handleHandUpdated
    );

    socket.on(
      "private-game-updated",
      handleGameUpdated
    );

    socket.on(
      "collect-trick",
      handleCollectTrick
    );

    socket.on(
      "new-private-hand",
      handleNewPrivateHand
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {
      socket.off(
        "hokm-chosen",
        handleHokmChosen
      );

      socket.off(
        "private-hand-updated",
        handleHandUpdated
      );

      socket.off(
        "private-game-updated",
        handleGameUpdated
      );

      socket.off(
        "collect-trick",
        handleCollectTrick
      );

      socket.off(
        "new-private-hand",
        handleNewPrivateHand
      );
    };
  }, [
    socket,
    playerNumber,

    setHakemPlayer,
    setHokm,

    setPrivateHand,

    setCurrentTurn,

    setPlayedCards,

    setTrickWinner,

    setTeam1Tricks,
    setTeam2Tricks,

    setTeam1Hands,
    setTeam2Hands,

    setHandWinner,
    setMatchWinner,

    handIsSorted,
  ]);

  // =========================
  // LOADING
  // =========================

  if (
    !room ||
    playerNumber === null ||
    hakemPlayer === null
  ) {
    return (
      <main className="gameTable">
        <div className="loadingText">
          Loading private game...
        </div>
      </main>
    );
  }

  // =========================
  // BASIC PLAYER INFO
  // =========================

  const amIHakem =
    playerNumber ===
    hakemPlayer;

  // =========================
  // SOUNDS
  // =========================

  function playSound(
    path: string,
    volume = 1
  ) {
    const audio =
      new Audio(path);

    audio.volume =
      volume;

    audio
      .play()
      .catch(() => {
        // Ignore browser audio blocking.
      });
  }

  // =========================
  // CHOOSE HOKM
  // =========================

  function chooseHokm(
    suit: Suit
  ) {
    if (
      !socket ||
      !amIHakem ||
      hokm ||
      matchWinner !== null
    ) {
      return;
    }

    socket.emit(
      "choose-hokm",
      {
        roomCode,
        suit,
      }
    );
  }

  // =========================
  // PLAY CARD
  // =========================

  function playPrivateCard(
    cardIndex: number
  ) {
    if (
      !socket ||
      !hokm ||
      currentTurn !==
        playerNumber ||
      trickWinner !== null ||
      handWinner !== null ||
      matchWinner !== null ||
      collectingCards !== null
    ) {
      return;
    }

    const card =
      privateHand[
        cardIndex
      ];

    if (!card) {
      return;
    }

    socket.emit(
      "play-card",
      {
        roomCode,

        suit:
          card.suit,

        rank:
          card.rank,
      }
    );
  }

  // =========================
  // NEXT TRICK
  // =========================

  function nextPrivateTrick() {
    if (
      !socket ||
      trickWinner === null ||
      handWinner !== null ||
      matchWinner !== null ||
      collectingCards !== null
    ) {
      return;
    }

    socket.emit(
      "next-trick",
      roomCode
    );
  }

  // =========================
  // NEXT HAND
  // =========================

  function nextPrivateHand() {
    if (
      !socket ||
      handWinner === null ||
      matchWinner !== null ||
      collectingCards !== null
    ) {
      return;
    }

    socket.emit(
      "next-hand",
      roomCode
    );
  }

  // =========================
  // SORT HAND
  // =========================

  function getSortedHand(
    hand:
      typeof privateHand
  ) {
    const suitOrder:
      Record<
        Suit,
        number
      > = {
        spades: 0,
        hearts: 1,
        clubs: 2,
        diamonds: 3,
      };

    const rankOrder:
      Record<
        string,
        number
      > = {
        A: 14,
        K: 13,
        Q: 12,
        J: 11,

        "10": 10,
        "9": 9,
        "8": 8,
        "7": 7,
        "6": 6,
        "5": 5,
        "4": 4,
        "3": 3,
        "2": 2,
      };

    return [
      ...hand,
    ].sort(
      (a, b) => {
        const suitDifference =
          suitOrder[
            a.suit
          ] -
          suitOrder[
            b.suit
          ];

        if (
          suitDifference !==
          0
        ) {
          return (
            suitDifference
          );
        }

        return (
          rankOrder[
            b.rank
          ] -
          rankOrder[
            a.rank
          ]
        );
      }
    );
  }

  function sortPrivateHand() {
    setHandIsSorted(
      true
    );

    setPrivateHand(
      getSortedHand(
        privateHand
      )
    );
  }

  // =========================
  // PLAYER POSITIONS
  // =========================

  /*
    Relative 1 = yourself
    Relative 2 = left
    Relative 3 = top
    Relative 4 = right
  */

  function getRelativePlayer(
    absolutePlayer:
      number
  ) {
    if (
      playerNumber === null
    ) {
      return 1;
    }

    return (
      (
        absolutePlayer -
        playerNumber +
        4
      ) %
        4
    ) + 1;
  }





function getPlayerName(
  absolutePlayer: number
) {
  const player =
    room?.players[
      absolutePlayer - 1
    ];

  return (
    player?.name ??
    `Player ${absolutePlayer}`
  );
}






  function getAbsolutePlayer(
    relativePlayer:
      number
  ) {
    if (
      playerNumber === null
    ) {
      return 1;
    }

    return (
      (
        playerNumber +
        relativePlayer -
        2
      ) %
        4
    ) + 1;
  }

  const leftPlayer =
    getAbsolutePlayer(
      2
    );

  const topPlayer =
    getAbsolutePlayer(
      3
    );

  const rightPlayer =
    getAbsolutePlayer(
      4
    );

  const relativeCurrentTurn =
    currentTurn === null
      ? null
      : getRelativePlayer(
          currentTurn
        );

  // =========================
  // SUIT SYMBOLS
  // =========================

  const suitSymbol:
    Record<
      Suit,
      string
    > = {
      spades: "♠",
      hearts: "♥",
      clubs: "♣",
      diamonds: "♦",
    };

  // =========================
  // SCORE DISPLAY
  // =========================

  const myTeamNumber:
    1 | 2 =
    playerNumber === 1 ||
    playerNumber === 3
      ? 1
      : 2;

  const myTeamScore =
    myTeamNumber === 1
      ? team1Tricks
      : team2Tricks;

  const opponentTeamScore =
    myTeamNumber === 1
      ? team2Tricks
      : team1Tricks;

  const myTeamHands =
    myTeamNumber === 1
      ? team1Hands
      : team2Hands;

  const opponentTeamHands =
    myTeamNumber === 1
      ? team2Hands
      : team1Hands;

  const didMyTeamWin =
    matchWinner !== null &&
    matchWinner ===
      myTeamNumber;

  // =========================
  // PAGE
  // =========================

  return (
    <main className="gameTable">

 {/* =====================
    MATCH WINNER SCREEN
====================== */}

{matchWinner !== null && (
  <div className="privateMatchEndOverlay">

    <div className="privateMatchEndPanel">

      <h1 className="privateMatchEndTitle">
        {didMyTeamWin
          ? "Your Team Wins!"
          : "Opponents Win!"}
      </h1>

      <p className="privateMatchEndLabel">
        Final Score
      </p>

      <div className="privateMatchEndScore">
        {myTeamHands}
        {" - "}
        {opponentTeamHands}
      </div>

      <button
        className="privateMatchPlayAgainButton"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Play Again
      </button>

    </div>

  </div>
)}

      {/* =====================
          NORMAL GAME
      ====================== */}

      {matchWinner === null && (
        <>

          {/* =====================
              PLAYER HEADS
          ====================== */}

          {hokm &&
            !isShuffling && (
              <>

                <div
                  className={`player playerTop ${
                    relativeCurrentTurn ===
                    3
                      ? "activePlayer"
                      : ""
                  }`}
                >
                 {getPlayerName(
  topPlayer
)}
                </div>

                <div
                  className={`player playerLeft ${
                    relativeCurrentTurn ===
                    2
                      ? "activePlayer"
                      : ""
                  }`}
                >
                {getPlayerName(
  leftPlayer
)}
                </div>

                <div
                  className={`player playerRight ${
                    relativeCurrentTurn ===
                    4
                      ? "activePlayer"
                      : ""
                  }`}
                >
                 {getPlayerName(
  rightPlayer
)}
                </div>

              </>
            )}


          {/* =====================
              WAITING FOR HÂKEM
          ====================== */}

          {!amIHakem &&
            !hokm && (
              <div className="privateGameDebug">

                <h1>
                  Private Hokm
                </h1>

                <p>
                  Room:{" "}
                  {roomCode}
                </p>

                <p>
                  You are Player{" "}
                  {playerNumber}
                </p>

                <p>
                  Hâkem: Player{" "}
                  {hakemPlayer}
                </p>

                <div className="privateWaitingMessage">
                  Waiting for{" "}
{getPlayerName(
  hakemPlayer
)} to choose Hokm...
                </div>

              </div>
            )}


          {/* =====================
              HÂKEM FIRST FIVE
          ====================== */}

          {amIHakem &&
            !hokm && (
              <div className="privateFirstFive">

                {privateHand.map(
                  (
                    card,
                    index
                  ) => (
                    <Card
                      key={
                        `${card.suit}-${card.rank}-${index}`
                      }
                      card={
                        card
                      }
                    />
                  )
                )}

                <button
                  className="sortButton"
                  onClick={
                    sortPrivateHand
                  }
                >
                  Sort
                </button>

              </div>
            )}


          {/* =====================
              CHOOSE HOKM
          ====================== */}

          {amIHakem &&
            !hokm && (
              <div className="hokmChooser">

                <h2>
                  You are the
                  Hâkem
                </h2>

                <p>
                  Choose the Hokm
                </p>

                <div className="hokmButtons">

                  <button
                    className="blackSuitButton"
                    onClick={() =>
                      chooseHokm(
                        "spades"
                      )
                    }
                  >
                    ♠
                  </button>

                  <button
                    className="redSuitButton"
                    onClick={() =>
                      chooseHokm(
                        "hearts"
                      )
                    }
                  >
                    ♥
                  </button>

                  <button
                    className="blackSuitButton"
                    onClick={() =>
                      chooseHokm(
                        "clubs"
                      )
                    }
                  >
                    ♣
                  </button>

                  <button
                    className="redSuitButton"
                    onClick={() =>
                      chooseHokm(
                        "diamonds"
                      )
                    }
                  >
                    ♦
                  </button>

                </div>

              </div>
            )}


          {/* =====================
              SHUFFLE
          ====================== */}

          {isShuffling &&
            hokm && (
              <div className="shuffleArea">

                <div
                  className={`shuffleCard shuffleCardOne ${
                    hokm ===
                      "hearts" ||
                    hokm ===
                      "diamonds"
                      ? "shuffleRedSuit"
                      : ""
                  }`}
                >
                  {
                    suitSymbol[
                      hokm as Suit
                    ]
                  }
                </div>

                <div
                  className={`shuffleCard shuffleCardTwo ${
                    hokm ===
                      "hearts" ||
                    hokm ===
                      "diamonds"
                      ? "shuffleRedSuit"
                      : ""
                  }`}
                >
                  {
                    suitSymbol[
                      hokm as Suit
                    ]
                  }
                </div>

              </div>
            )}


          {/* =====================
              HOKM DISPLAY
          ====================== */}

          {hokm &&
            !isShuffling && (
              <div className="hokmDisplay">

                Hokm:

                <span>
                  {
                    suitSymbol[
                      hokm as Suit
                    ]
                  }
                </span>

              </div>
            )}


          {/* =====================
              SCORES
          ====================== */}

          {hokm &&
            !isShuffling && (
              <div className="scoreDisplay">

                <div>

                  <span>
                    Your Team
                  </span>

                  <strong>
                    {myTeamScore}
                  </strong>

                </div>


                <div className="matchScoreDisplay">

                  <span>
                    Hands
                  </span>

                  <strong>
                    {myTeamHands}
                    {" - "}
                    {
                      opponentTeamHands
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Opponents
                  </span>

                  <strong>
                    {
                      opponentTeamScore
                    }
                  </strong>

                </div>

              </div>
            )}


          {/* =====================
              CENTRE TRICK
          ====================== */}

          {hokm &&
            !isShuffling && (
              <div className="trickArea">


                {/* =================
                    RESULT
                ================== */}

                {trickWinner !==
                  null && (
                    <div className="trickResult">

                      <div
                        className={
                          handWinner !==
                          null
                            ? "handWinnerText"
                            : "trickWinnerText"
                        }
                      >

                        {handWinner !==
                        null
                          ? handWinner ===
                            myTeamNumber
                            ? "Your Team wins the hand"
                            : "Opponents win the hand"

                          : trickWinner ===
                              playerNumber
                            ? "You win the trick"

                            : `${getPlayerName(
  trickWinner
)} wins the trick`}

                      </div>


                      {handWinner !==
                      null ? (

                        <button
                          className="nextTrickButton"
                          onClick={
                            nextPrivateHand
                          }
                          disabled={
                            collectingCards !==
                            null
                          }
                        >
                          Next Hand
                        </button>

                      ) : (

                        <button
                          className="nextTrickButton"
                          onClick={
                            nextPrivateTrick
                          }
                          disabled={
                            collectingCards !==
                            null
                          }
                        >
                          Next Trick
                        </button>

                      )}

                    </div>
                  )}


                {/* =================
                    YOUR TURN
                ================== */}

                {currentTurn ===
                  playerNumber &&
                  playedCards.length <
                    4 &&
                  trickWinner ===
                    null &&
                  handWinner ===
                    null &&
                  collectingCards ===
                    null && (
                    <div className="yourTurnText">
                      Your turn
                    </div>
                  )}


                {/* =================
                    PLAYED CARDS
                ================== */}

                {playedCards.map(
                  played => {
                    const relativePlayer =
                      getRelativePlayer(
                        played.player
                      );

                    let positionClass =
                      "";

                    if (
                      relativePlayer ===
                      1
                    ) {
                      positionClass =
                        "playerPlayedCard";
                    }

                    if (
                      relativePlayer ===
                      2
                    ) {
                      positionClass =
                        "leftPlayedCard";
                    }

                    if (
                      relativePlayer ===
                      3
                    ) {
                      positionClass =
                        "topPlayedCard";
                    }

                    if (
                      relativePlayer ===
                      4
                    ) {
                      positionClass =
                        "rightPlayedCard";
                    }

                    return (
                      <div
                        key={
                          played.player
                        }
                        className={`
                          playedCard

                          ${positionClass}

                          player${relativePlayer}CardAnimation

                          ${
                            trickWinner ===
                            played.player
                              ? "winningPlayedCard"
                              : ""
                          }

                          ${
                            collectingCards !==
                            null
                              ? `collectToPlayer${collectingCards}`
                              : ""
                          }
                        `}
                      >

                        <Card
                          card={
                            played.card
                          }
                          isHokm={
                            played.card
                              .suit ===
                            hokm
                          }
                        />

                      </div>
                    );
                  }
                )}

              </div>
            )}


          {/* =====================
              PLAYER HAND
          ====================== */}

          {hokm &&
            !isShuffling && (
              <div className="hand">

                {privateHand.map(
                  (
                    card,
                    index
                  ) => (
                    <Card
                      key={
                        `${card.suit}-${card.rank}`
                      }

                      card={
                        card
                      }

                      isHokm={
                        card.suit ===
                        hokm
                      }

                      onClick={() =>
                        playPrivateCard(
                          index
                        )
                      }

                      disabled={
                        currentTurn !==
                          playerNumber ||
                        trickWinner !==
                          null ||
                        handWinner !==
                          null ||
                        collectingCards !==
                          null
                      }
                    />
                  )
                )}

                <button
                  className="sortButton"
                  onClick={
                    sortPrivateHand
                  }
                >
                  Sort
                </button>

              </div>
            )}

        </>
      )}

    </main>
  );
}