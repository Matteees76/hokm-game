"use client";

import {
  useEffect,
  useState,
  useRef,
  type CSSProperties,
} from "react";

import Card from "@/components/Card";

import {
  Card as CardType,
  Suit,
  createDeck,
  shuffleDeck,
} from "@/game/deck";

type GamePhase =
  | "loading"
  | "choose-hokm"
  | "shuffling"
  | "dealing"
  | "playing";

type GameState = {
  deck: CardType[];
  player1: CardType[];
  player2: CardType[];
  player3: CardType[];
  player4: CardType[];
  hokm: Suit | null;
  phase: GamePhase;
};

type VoidSuits = {
  1: Suit[];
  2: Suit[];
  3: Suit[];
  4: Suit[];
};

export default function GamePage() {
  const [game, setGame] =
    useState<GameState | null>(null);

    type PlayedCard = {
  player: number;
  card: CardType;
};

const [playedCards, setPlayedCards] =
  useState<PlayedCard[]>([]);

  const [trickWinner, setTrickWinner] =
  useState<number | null>(null);

const [team1Tricks, setTeam1Tricks] =
  useState(0);

const [team2Tricks, setTeam2Tricks] =
  useState(0);

const [team1Hands, setTeam1Hands] =
  useState(0);

const [team2Hands, setTeam2Hands] =
  useState(0);

const [matchWinner, setMatchWinner] =
  useState<1 | 2 | null>(null);

  const [handWinner, setHandWinner] =
  useState<1 | 2 | null>(null);

  const [currentTurn, setCurrentTurn] =
  useState(1);

  const [hakemPlayer, setHakemPlayer] =
  useState(1);

  const [dealingCards, setDealingCards] =
  useState(false);

const [activePlayer, setActivePlayer] =
  useState<number | null>(null);


const [winningCardPlayer, setWinningCardPlayer] =
  useState<number | null>(null);

const [collectingCards, setCollectingCards] =
  useState<number | null>(null);

  const suitSymbols: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  clubs: "♣",
  diamonds: "♦",
};

const [voidSuits, setVoidSuits] =
  useState<VoidSuits>({
    1: [],
    2: [],
    3: [],
    4: [],
  });








  useEffect(() => {
    const deck =
      shuffleDeck(createDeck());

    // For now, YOU are always the Hâkem.
    // Give the Hâkem the first 5 cards.
    const firstFive =
      deck.slice(0, 5);

    const remainingDeck =
      deck.slice(5);

    setGame({
      deck: remainingDeck,

      player1: firstFive,
      player2: [],
      player3: [],
      player4: [],

      hokm: null,

      phase: "choose-hokm",
    });
  }, []);







function startAnimatedDeal(
  currentGame: GameState,
  suit: Suit
) {
  const remainingDeck = [
    ...currentGame.deck,
  ];

  const player1 = [
    ...currentGame.player1,
  ];

  const player2: CardType[] = [];
  const player3: CardType[] = [];
  const player4: CardType[] = [];

  /*
    Build everyone's final hands first.
  */

  while (
    player1.length < 13 &&
    remainingDeck.length > 0
  ) {
    const card =
      remainingDeck.shift();

    if (card) {
      player1.push(card);
    }
  }

  while (
    player2.length < 13 &&
    remainingDeck.length > 0
  ) {
    const card =
      remainingDeck.shift();

    if (card) {
      player2.push(card);
    }
  }

  while (
    player3.length < 13 &&
    remainingDeck.length > 0
  ) {
    const card =
      remainingDeck.shift();

    if (card) {
      player3.push(card);
    }
  }

  while (
    player4.length < 13 &&
    remainingDeck.length > 0
  ) {
    const card =
      remainingDeck.shift();

    if (card) {
      player4.push(card);
    }
  }

  /*
    Keep your original 5 cards visible.

    We'll add the remaining 8 one by one.
  */

  const startingFive =
    player1.slice(0, 5);

  const cardsToDeal =
    player1.slice(5);

  setGame({
    deck: [],

    player1: startingFive,

    // Bots can receive theirs immediately
    // because their hands aren't visible.
    player2,
    player3,
    player4,

    hokm: suit,

    phase: "dealing",
  });

  setDealingCards(true);

  cardsToDeal.forEach(
    (card, index) => {
      setTimeout(() => {
        setGame(previous => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,

            player1: [
              ...previous.player1,
              card,
            ],
          };
        });

        /*
          Last card has arrived.
        */
        if (
          index ===
          cardsToDeal.length - 1
        ) {
          setTimeout(() => {
            setGame(previous => {
              if (!previous) {
                return previous;
              }

              return {
                ...previous,
                phase: "playing",
              };
            });

            setDealingCards(false);
          }, 250);
        }
      }, index * 180);
    }
  );
}

function playSound(path: string, volume = 1) {
  const audio = new Audio(path);

  audio.volume = volume;

  audio.play().catch(() => {
    // Browser may block audio before first interaction.
  });
}

function chooseHokm(suit: Suit) {
  if (!game) return;



  const originalGame = game;

  setGame({
    ...game,
    hokm: suit,
    phase: "shuffling",
  });

playSound(
  "/sounds/shuffle.mp3",
  0.6
);

  setTimeout(() => {
    startAnimatedDeal(
      originalGame,
      suit
    );
  }, 1400);
}

function getCardValue(card: CardType) {
  const values = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  return values[card.rank];
}
function determineTrickWinner(
  cards: PlayedCard[],
  leadSuit: Suit,
  hokm: Suit
) {
  let winner = cards[0];

  for (let i = 1; i < cards.length; i++) {
    const challenger = cards[i];

    const winnerIsHokm =
      winner.card.suit === hokm;

    const challengerIsHokm =
      challenger.card.suit === hokm;

    // Hokm beats a non-Hokm card.
    if (
      challengerIsHokm &&
      !winnerIsHokm
    ) {
      winner = challenger;
      continue;
    }

    // A non-Hokm card cannot beat Hokm.
    if (
      !challengerIsHokm &&
      winnerIsHokm
    ) {
      continue;
    }

    // If both cards are Hokm,
    // highest Hokm wins.
    if (
      challengerIsHokm &&
      winnerIsHokm
    ) {
      if (
        getCardValue(challenger.card) >
        getCardValue(winner.card)
      ) {
        winner = challenger;
      }

      continue;
    }

    // Neither card is Hokm.
    // Only cards matching the lead suit
    // can win.
    const winnerFollowsLead =
      winner.card.suit === leadSuit;

    const challengerFollowsLead =
      challenger.card.suit === leadSuit;

    if (
      challengerFollowsLead &&
      !winnerFollowsLead
    ) {
      winner = challenger;
      continue;
    }

    if (
      challengerFollowsLead &&
      winnerFollowsLead &&
      getCardValue(challenger.card) >
        getCardValue(winner.card)
    ) {
      winner = challenger;
    }
  }

  return winner.player;
}

function getNextPlayer(player: number) {
  return player === 4 ? 1 : player + 1;
}

function getPlayerHand(
  currentGame: GameState,
  player: number
): CardType[] {
  if (player === 1) return currentGame.player1;
  if (player === 2) return currentGame.player2;
  if (player === 3) return currentGame.player3;

  return currentGame.player4;
}

function removeCardFromPlayer(
  currentGame: GameState,
  player: number,
  card: CardType
): GameState {
  if (player === 1) {
    return {
      ...currentGame,
      player1:
        currentGame.player1.filter(
          item => item !== card
        ),
    };
  }

  if (player === 2) {
    return {
      ...currentGame,
      player2:
        currentGame.player2.filter(
          item => item !== card
        ),
    };
  }

  if (player === 3) {
    return {
      ...currentGame,
      player3:
        currentGame.player3.filter(
          item => item !== card
        ),
    };
  }

  return {
    ...currentGame,
    player4:
      currentGame.player4.filter(
        item => item !== card
      ),
  };
}

function getTeammate(
  player: number
) {
  if (player === 1) return 3;
  if (player === 2) return 4;
  if (player === 3) return 1;

  return 2;
}


function chooseBotCard(
  hand: CardType[],
  leadSuit: Suit | null,
  currentTrick: PlayedCard[],
  botPlayer: number,
  hokm: Suit
): CardType | null {
  if (hand.length === 0) {
    return null;
  }

  const rankValues: Record<string, number> = {
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

  function getValue(card: CardType) {
    return rankValues[card.rank];
  }

  function sortLowToHigh(
    cards: CardType[]
  ) {
    return [...cards].sort(
      (a, b) =>
        getValue(a) -
        getValue(b)
    );
  }

  /*
    BOT IS LEADING
  */

  if (currentTrick.length === 0) {
  const teammate =
    getTeammate(botPlayer);

  const teammateKey =
    teammate as 1 | 2 | 3 | 4;

  const knownVoidSuits =
    voidSuits[teammateKey];

  // Prefer to lead a non-Hokm suit
  // that the teammate is known to be void in.
  const usefulLeadCards =
    hand.filter(
      card =>
        knownVoidSuits.includes(
          card.suit
        ) &&
        card.suit !== hokm
    );

  if (usefulLeadCards.length > 0) {
    return sortLowToHigh(
      usefulLeadCards
    )[0];
  }

  // Otherwise lead a low non-Hokm card.
  const nonHokmCards =
    hand.filter(
      card =>
        card.suit !== hokm
    );

  if (nonHokmCards.length > 0) {
    return sortLowToHigh(
      nonHokmCards
    )[0];
  }

  // If only Hokm remains,
  // play the lowest Hokm.
  return sortLowToHigh(hand)[0];
}

  const actualLeadSuit =
    currentTrick[0].card.suit;

  /*
    Work out who is currently
    winning the trick.
  */

  const currentWinner =
    determineTrickWinner(
      currentTrick,
      actualLeadSuit,
      hokm
    );

  const botTeam =
    botPlayer === 1 ||
    botPlayer === 3
      ? 1
      : 2;

  const winnerTeam =
    currentWinner === 1 ||
    currentWinner === 3
      ? 1
      : 2;

  const teammateWinning =
    botTeam === winnerTeam;

  /*
    FIRST:
    Does the bot have to
    follow the lead suit?
  */

  const matchingSuitCards =
    hand.filter(
      card =>
        card.suit === actualLeadSuit
    );

  if (matchingSuitCards.length > 0) {
    const sortedMatchingCards =
      sortLowToHigh(
        matchingSuitCards
      );

    /*
      Teammate already winning:
      use weakest possible card.
    */

    if (teammateWinning) {
      return sortedMatchingCards[0];
    }

    /*
      Opponent is winning:
      find the lowest card in
      the led suit that can win.
    */

    for (
      const card
      of sortedMatchingCards
    ) {
      const testTrick: PlayedCard[] = [
        ...currentTrick,
        {
          player: botPlayer,
          card,
        },
      ];

      const testWinner =
        determineTrickWinner(
          testTrick,
          actualLeadSuit,
          hokm
        );

      if (
        testWinner === botPlayer
      ) {
        return card;
      }
    }

    /*
      Can't win while following suit,
      so throw lowest matching card.
    */

    return sortedMatchingCards[0];
  }

  /*
    The bot cannot follow suit.

    Now it may be able to use Hokm.
  */

  const hokmCards =
    sortLowToHigh(
      hand.filter(
        card =>
          card.suit === hokm
      )
    );

  const nonHokmCards =
    sortLowToHigh(
      hand.filter(
        card =>
          card.suit !== hokm
      )
    );

  /*
    Teammate is already winning:
    DON'T waste a Hokm.
  */

  if (teammateWinning) {
    if (nonHokmCards.length > 0) {
      return nonHokmCards[0];
    }

    /*
      Only Hokm cards remain.
    */

    return hokmCards[0] ?? null;
  }

  /*
    Opponent is winning.

    Try each Hokm from lowest to
    highest and use the weakest
    one that wins the trick.
  */

  for (const card of hokmCards) {
    const testTrick: PlayedCard[] = [
      ...currentTrick,
      {
        player: botPlayer,
        card,
      },
    ];

    const testWinner =
      determineTrickWinner(
        testTrick,
        actualLeadSuit,
        hokm
      );

    if (
      testWinner === botPlayer
    ) {
      return card;
    }
  }

  /*
    No Hokm can win.

    Throw away the weakest
    non-Hokm card if possible.
  */

  if (nonHokmCards.length > 0) {
    return nonHokmCards[0];
  }

  /*
    Only Hokm cards remain,
    so play the weakest one.
  */

  if (hokmCards.length > 0) {
    return hokmCards[0];
  }

  return null;
}

function finishTrick(
  completedTrick: PlayedCard[],
  leadSuit: Suit,
  currentGame: GameState
) {
  if (!currentGame.hokm) {
    return;
  }

  const winner =
    determineTrickWinner(
      completedTrick,
      leadSuit,
      currentGame.hokm
    );

  setTrickWinner(winner);

  playSound(
  "/sounds/trick-win.mp3",
  0.6
);
setWinningCardPlayer(winner);
  setCurrentTurn(winner);

  // Your team:
  // Player 1 + Player 3
  if (
  winner === 1 ||
  winner === 3
) {
  const newScore =
    team1Tricks + 1;

  setTeam1Tricks(newScore);

 if (newScore >= 7) {
  setHandWinner(1);
  setHakemPlayer(winner);
}
}

  // Opposing team:
  // Player 2 + Player 4
 else {
  const newScore =
    team2Tricks + 1;

  setTeam2Tricks(newScore);

  if (newScore >= 7) {
  setHandWinner(2);
  setHakemPlayer(winner);
}
}

setActivePlayer(null);
}

async function continueBotTurns(
  startingGame: GameState,
  startingCards: PlayedCard[],
  startingPlayer: number
) {
  let workingGame =
    startingGame;

    
  let workingCards = [
    ...startingCards,
  ];

  let player =
    startingPlayer;

 while (
  player !== 1 &&
  workingCards.length < 4
) {
  setActivePlayer(player);

  await new Promise(
    resolve =>
      setTimeout(resolve, 700)
  );

  const leadSuit =
    workingCards.length > 0
      ? workingCards[0].card.suit
      : null;

    const hand =
      getPlayerHand(
        workingGame,
        player
      );

   const botCard =
  chooseBotCard(
    hand,
    leadSuit,
    workingCards,
    player,
    workingGame.hokm!
  );

   if (!botCard) {
  console.error(
    `Player ${player} has no card to play.`
  );

  return;
}

// Remember if this player
// could not follow the lead suit.
if (
  leadSuit &&
  botCard.suit !== leadSuit
) {
  rememberVoidSuit(
    player,
    leadSuit
  );
}

workingGame =
  removeCardFromPlayer(
    workingGame,
    player,
    botCard
  );

    workingCards = [
      ...workingCards,
      {
        player,
        card: botCard,
      },
    ];

  setGame(workingGame);

setPlayedCards(
  workingCards
);

// Card placement sound for bots.
playSound(
  "/sounds/card-play.mp3",
  0.55
);

player =
  getNextPlayer(player);
  }

  // All four cards have now
  // been played.
  if (workingCards.length === 4) {
    const leadSuit =
      workingCards[0].card.suit;

    finishTrick(
      workingCards,
      leadSuit,
      workingGame
    );

    return;
  }

  // We reached Player 1,
  // so now it's your turn.
 setCurrentTurn(1);
setActivePlayer(null);
}


function sortPlayerHand() {
  if (!game) return;

  const suitOrder = {
    spades: 0,
    hearts: 1,
    clubs: 2,
    diamonds: 3,
  };

  const rankOrder: Record<string, number> = {
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

  const sortedHand = [
    ...game.player1,
  ].sort((a, b) => {
    const suitDifference =
      suitOrder[a.suit] -
      suitOrder[b.suit];

    if (suitDifference !== 0) {
      return suitDifference;
    }

    return (
      rankOrder[b.rank] -
      rankOrder[a.rank]
    );
  });

  setGame({
    ...game,
    player1: sortedHand,
  });
}


function canPlayCard(card: CardType) {
  if (!game) {
    return false;
  }

  if (handWinner !== null) {
  return false;
}

  if (game.phase !== "playing") {
    return false;
  }

  if (currentTurn !== 1) {
    return false;
  }

  if (trickWinner !== null) {
    return false;
  }

  // If you're leading the trick,
  // any card is legal.
  if (playedCards.length === 0) {
    return true;
  }

  const leadSuit =
    playedCards[0].card.suit;

  const hasLeadSuit =
    game.player1.some(
      handCard =>
        handCard.suit === leadSuit
    );

  // If you don't have the lead suit,
  // you may play anything.
  if (!hasLeadSuit) {
    return true;
  }

  // Otherwise you must follow suit.
  return card.suit === leadSuit;
}


function rememberVoidSuit(
  player: number,
  suit: Suit
) {
  setVoidSuits(previous => {
    const playerKey =
      player as 1 | 2 | 3 | 4;

    if (
      previous[playerKey].includes(suit)
    ) {
      return previous;
    }

    return {
      ...previous,

      [playerKey]: [
        ...previous[playerKey],
        suit,
      ],
    };
  });
}


function playCard(cardIndex: number) {
  if (!game) return;

  if (
    game.phase !== "playing"
  ) {
    return;
  }

  // You can only click cards
  // when it is actually your turn.
  if (currentTurn !== 1) {
    return;
  }

  // Don't allow another move
  // after the trick has finished.
  if (trickWinner !== null) {
    return;
  }

  const selectedCard =
    game.player1[cardIndex];

  if (!selectedCard) {
    return;
  }

  const leadSuit =
    playedCards.length > 0
      ? playedCards[0].card.suit
      : null;

  // If another player led a suit,
  // you MUST follow it if possible.
  if (leadSuit) {
    const hasLeadSuit =
      game.player1.some(
        card =>
          card.suit === leadSuit
      );

    if (
      hasLeadSuit &&
      selectedCard.suit !== leadSuit
    ) {
      return;
    }
  }


  // Remember when Player 1
// is void in the lead suit.
if (
  leadSuit &&
  selectedCard.suit !== leadSuit
) {
  rememberVoidSuit(
    1,
    leadSuit
  );
}

  const updatedGame =
    removeCardFromPlayer(
      game,
      1,
      selectedCard
    );

  const updatedCards: PlayedCard[] = [
    ...playedCards,
    {
      player: 1,
      card: selectedCard,
    },
  ];

  setGame(updatedGame);

setPlayedCards(
  updatedCards
);

// Play card placement sound.
playSound(
  "/sounds/card-play.mp3",
  0.55
);

// If you're the fourth card,
// resolve the trick immediately.
  if (updatedCards.length === 4) {
    const actualLeadSuit =
      updatedCards[0].card.suit;

    finishTrick(
      updatedCards,
      actualLeadSuit,
      updatedGame
    );

    return;
  }

  const nextPlayer =
    getNextPlayer(1);

  setCurrentTurn(
    nextPlayer
  );

  continueBotTurns(
    updatedGame,
    updatedCards,
    nextPlayer
  );
}

function nextTrick() {
  if (
    trickWinner === null ||
    !game ||
    handWinner !== null
  ) {
    return;
  }

  const leader =
    trickWinner;

setCollectingCards(leader);
setWinningCardPlayer(null);

setTimeout(() => {
  setPlayedCards([]);
  setTrickWinner(null);
  setCollectingCards(null);
}, 450);

  setCurrentTurn(
    leader
  );

  // If you won, wait for
  // you to choose a card.
  if (leader === 1) {
    return;
  }

  // If a bot won, that bot
  // leads the next trick.
  continueBotTurns(
    game,
    [],
    leader
  );
}


function chooseBestHokm(
  cards: CardType[]
): Suit {
  const suits: Suit[] = [
    "spades",
    "hearts",
    "clubs",
    "diamonds",
  ];

  const rankValues: Record<string, number> = {
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

  let bestSuit: Suit = "spades";
  let bestCount = -1;
  let bestStrength = -1;

  for (const suit of suits) {
    const suitCards =
      cards.filter(
        card =>
          card.suit === suit
      );

    const count =
      suitCards.length;

    const strength =
      suitCards.reduce(
        (total, card) =>
          total + rankValues[card.rank],
        0
      );

    if (
      count > bestCount ||
      (
        count === bestCount &&
        strength > bestStrength
      )
    ) {
      bestSuit = suit;
      bestCount = count;
      bestStrength = strength;
    }
  }

  return bestSuit;
}


function chooseBotHokm(
  player: number,
  suit: Suit,
  remainingDeck: CardType[],
  firstFive: CardType[]
) {
  const player1: CardType[] = [];
  const player2: CardType[] = [];
  const player3: CardType[] = [];
  const player4: CardType[] = [];

  if (player === 1) {
    player1.push(...firstFive);
  }

  if (player === 2) {
    player2.push(...firstFive);
  }

  if (player === 3) {
    player3.push(...firstFive);
  }

  if (player === 4) {
    player4.push(...firstFive);
  }

  const deckCopy = [
    ...remainingDeck,
  ];

  while (
    player1.length < 13 &&
    deckCopy.length > 0
  ) {
    const card = deckCopy.shift();

    if (card) {
      player1.push(card);
    }
  }

  while (
    player2.length < 13 &&
    deckCopy.length > 0
  ) {
    const card = deckCopy.shift();

    if (card) {
      player2.push(card);
    }
  }

  while (
    player3.length < 13 &&
    deckCopy.length > 0
  ) {
    const card = deckCopy.shift();

    if (card) {
      player3.push(card);
    }
  }

  while (
    player4.length < 13 &&
    deckCopy.length > 0
  ) {
    const card = deckCopy.shift();

    if (card) {
      player4.push(card);
    }
  }

  const newGame: GameState = {
  deck: [],

  player1,
  player2,
  player3,
  player4,

  hokm: suit,

  phase: "playing",
};

setGame(newGame);

setCurrentTurn(player);

// The bot Hâkem leads the first trick.
setTimeout(() => {
  continueBotTurns(
    newGame,
    [],
    player
  );
}, 700);
}


function nextHand() {
  if (handWinner === null) {
    return;
  }

  let newTeam1Hands =
    team1Hands;

  let newTeam2Hands =
    team2Hands;

  if (handWinner === 1) {
    newTeam1Hands =
      team1Hands + 1;

    setTeam1Hands(
      newTeam1Hands
    );
  }

  if (handWinner === 2) {
    newTeam2Hands =
      team2Hands + 1;

    setTeam2Hands(
      newTeam2Hands
    );
  }

  // Check for overall match winner.
  if (newTeam1Hands >= 7) {
    setMatchWinner(1);
    return;
  }

  if (newTeam2Hands >= 7) {
    setMatchWinner(2);
    return;
  }

  const deck =
    shuffleDeck(createDeck());

 const firstFive =
  deck.slice(0, 5);

const remainingDeck =
  deck.slice(5);

const player1: CardType[] = [];
const player2: CardType[] = [];
const player3: CardType[] = [];
const player4: CardType[] = [];

if (hakemPlayer === 1) {
  player1.push(...firstFive);
}

if (hakemPlayer === 2) {
  player2.push(...firstFive);
}

if (hakemPlayer === 3) {
  player3.push(...firstFive);
}

if (hakemPlayer === 4) {
  player4.push(...firstFive);
}

setGame({
  deck: remainingDeck,

  player1,
  player2,
  player3,
  player4,

  hokm: null,

  phase:
    hakemPlayer === 1
      ? "choose-hokm"
      : "playing",
});



  setPlayedCards([]);

  setTrickWinner(null);

  setTeam1Tricks(0);
  setTeam2Tricks(0);

  setHandWinner(null);

 setCurrentTurn(hakemPlayer);

if (hakemPlayer !== 1) {
  setTimeout(() => {
    const botHokm =
  chooseBestHokm(firstFive);

   chooseBotHokm(
  hakemPlayer,
  botHokm,
  remainingDeck,
  firstFive
);
  }, 700);
}

setVoidSuits({
  1: [],
  2: [],
  3: [],
  4: [],
});


}
function playAgain() {
  const deck =
    shuffleDeck(createDeck());

  const firstFive =
    deck.slice(0, 5);

  const remainingDeck =
    deck.slice(5);

  setGame({
    deck: remainingDeck,

    player1: firstFive,
    player2: [],
    player3: [],
    player4: [],

    hokm: null,

    phase: "choose-hokm",
  });

  setPlayedCards([]);

  setTrickWinner(null);

  setTeam1Tricks(0);
  setTeam2Tricks(0);

  setTeam1Hands(0);
  setTeam2Hands(0);

  setHandWinner(null);

  setMatchWinner(null);

  setCurrentTurn(1);

setVoidSuits({
  1: [],
  2: [],
  3: [],
  4: [],
});

}

 

  if (!game) {
    return (
      <main className="gameTable">
        <div className="loadingText">
          Dealing...
        </div>
      </main>
    );
  }

  return (
    <main className="gameTable">

      {/* =====================
          MATCH WINNER SCREEN
      ====================== */}

      {matchWinner !== null && (
        <div className="privateMatchEndOverlay">

          <div className="privateMatchEndPanel">

            <h1 className="privateMatchEndTitle">
              {matchWinner === 1
                ? "Your Team Wins!"
                : "Opponents Win!"}
            </h1>

            <p className="privateMatchEndLabel">
              Final Score
            </p>

            <div className="privateMatchEndScore">
              {team1Hands}
              {" - "}
              {team2Hands}
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




      <div
  className={`player playerTop ${
    activePlayer === 3
      ? "activePlayer"
      : ""
  }`}
>
  Player 3
</div>

     <div
  className={`player playerLeft ${
    activePlayer === 2
      ? "activePlayer"
      : ""
  }`}
>
  Player 2
</div>

     <div
  className={`player playerRight ${
    activePlayer === 4
      ? "activePlayer"
      : ""
  }`}
>
  Player 4
</div>

      {game.hokm && (
        <div className="hokmDisplay">
          Hokm:
          <span>
            {suitSymbols[game.hokm]}
          </span>
        </div>

        
      )}
<div className="scoreDisplay">
  <div>
    <span>Your Team</span>
    <strong>{team1Tricks}</strong>
  </div>

<div className="matchScoreDisplay">
  <span>
    Hands
  </span>

  <strong>
    {team1Hands} - {team2Hands}
  </strong>
</div>

  <div>
    <span>Opponents</span>
    <strong>{team2Tricks}</strong>
  </div>
</div>
      {game.phase === "choose-hokm" && (
        <div className="hokmChooser">

          <h2>You are the Hâkem</h2>

          <p>
            Choose the Hokm
          </p>

          <div className="hokmButtons">

            <button
              className="blackSuitButton"
              onClick={() =>
                chooseHokm("spades")
              }
            >
              ♠
            </button>

            <button
              className="redSuitButton"
              onClick={() =>
                chooseHokm("hearts")
              }
            >
              ♥
            </button>

           

            <button
              className="blackSuitButton"
              onClick={() =>
                chooseHokm("clubs")
              }
            >
              ♣
            </button>

            <button
              className="redSuitButton"
              onClick={() =>
                chooseHokm("diamonds")
              }
            >
              ♦
            </button>

          </div>

        </div>
      )}

    {game.phase === "playing" && (

  <div className="trickArea">
{trickWinner !== null && (
  <div className="trickResult">

    <div
  className={
    handWinner !== null
      ? "handWinnerText"
      : "trickWinnerText"
  }
>
  {handWinner === 1
    ? "Your Team wins the hand"
    : handWinner === 2
    ? "Opponents win the hand"
    : trickWinner === 1
    ? "You win the trick"
    : `Player ${trickWinner} wins the trick`}
</div>

  {matchWinner !== null ? (
  <button
    className="nextTrickButton"
    onClick={playAgain}
  >
    Play Again
  </button>
) : handWinner !== null ? (
  <button
    className="nextTrickButton"
    onClick={nextHand}
  >
    Next Hand
  </button>
) : (
  <button
    className="nextTrickButton"
    onClick={nextTrick}
  >
    Next Trick
  </button>
)}

  </div>
)}


   {currentTurn === 1 &&
  trickWinner === null && (
    <div className="yourTurnText">
      Your turn
    </div>
)}

    {playedCards.map(
      played => {

        let positionClass = "";

        if (played.player === 1) {
          positionClass =
            "playerPlayedCard";
        }

        if (played.player === 2) {
          positionClass =
            "leftPlayedCard";
        }

        if (played.player === 3) {
          positionClass =
            "topPlayedCard";
        }

        if (played.player === 4) {
          positionClass =
            "rightPlayedCard";
        }

        return (
          <div
  key={played.player}
  className={`
    playedCard
    ${positionClass}
    player${played.player}CardAnimation
    ${winningCardPlayer === played.player ? "winningPlayedCard" : ""}
    ${collectingCards !== null ? `collectToPlayer${collectingCards}` : ""}
  `}
>
   <Card
  card={played.card}
  isHokm={
    played.card.suit === game.hokm
  }
/>
          </div>
        );
      }
    )}

  </div>
)}


{game.phase === "shuffling" && game.hokm && (
  <div className="shuffleArea">

   <div
  className={`shuffleCard shuffleCardOne ${
    game.hokm === "hearts" ||
    game.hokm === "diamonds"
      ? "shuffleRedSuit"
      : ""
  }`}
>
  {suitSymbols[game.hokm]}
</div>

<div
  className={`shuffleCard shuffleCardTwo ${
    game.hokm === "hearts" ||
    game.hokm === "diamonds"
      ? "shuffleRedSuit"
      : ""
  }`}
>
  {suitSymbols[game.hokm]}
</div>

  </div>
)}

<div
  className="hand"
  style={
    {
      "--hand-count": Math.max(
        game.player1.length,
        2
      ),
    } as CSSProperties
  }
>
  {game.player1.map(
    (card, index) => (
      <Card
  key={`${card.suit}-${card.rank}`}
  card={card}
  isHokm={card.suit === game.hokm}
  onClick={() =>
    playCard(index)
  }
  disabled={!canPlayCard(card)}
/>


    ))}
    <button
  className="sortButton"
  onClick={sortPlayerHand}
>
  Sort
</button>
</div>

        </>
      )}

    </main>
  );

  


}