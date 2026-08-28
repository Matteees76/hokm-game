const { Server } = require("socket.io");
const http = require("http");

const PORT =
  process.env.PORT || 3001;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:3000";

const httpServer =
  http.createServer(
    (req, res) => {

      // =========================
      // SERVER HOME / HEALTH CHECK
      // =========================

      if (
        req.url === "/" ||
        req.url === "/health"
      ) {
        res.writeHead(
          200,
          {
            "Content-Type":
              "text/plain",
          }
        );

        res.end(
          "Hokm multiplayer server is running."
        );

        return;
      }

      // =========================
      // UNKNOWN ROUTE
      // =========================

      res.writeHead(
        404,
        {
          "Content-Type":
            "text/plain",
        }
      );

      res.end(
        "Not Found"
      );
    }
  );
  
const io =
  new Server(
    httpServer,
    {
      cors: {
        origin:
          CLIENT_URL,

        methods: [
          "GET",
          "POST",
        ],
      },
    }
  );

const rooms = {};
const onlineQueue = [];

const suits = [
  "spades",
  "hearts",
  "clubs",
  "diamonds",
];

const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

function getCardValue(card) {
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
  cards,
  leadSuit,
  hokm
) {
  let winner = cards[0];

  for (
    let i = 1;
    i < cards.length;
    i++
  ) {
    const challenger =
      cards[i];

    const winnerIsHokm =
      winner.card.suit ===
      hokm;

    const challengerIsHokm =
      challenger.card.suit ===
      hokm;

    if (
      challengerIsHokm &&
      !winnerIsHokm
    ) {
      winner =
        challenger;

      continue;
    }

    if (
      !challengerIsHokm &&
      winnerIsHokm
    ) {
      continue;
    }

    if (
      challengerIsHokm &&
      winnerIsHokm
    ) {
      if (
        getCardValue(
          challenger.card
        ) >
        getCardValue(
          winner.card
        )
      ) {
        winner =
          challenger;
      }

      continue;
    }

    const winnerFollowsLead =
      winner.card.suit ===
      leadSuit;

    const challengerFollowsLead =
      challenger.card.suit ===
      leadSuit;

    if (
      challengerFollowsLead &&
      !winnerFollowsLead
    ) {
      winner =
        challenger;

      continue;
    }

    if (
      challengerFollowsLead &&
      winnerFollowsLead &&
      getCardValue(
        challenger.card
      ) >
        getCardValue(
          winner.card
        )
    ) {
      winner =
        challenger;
    }
  }

  return winner.player;
}

function createDeck() {
  const deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
      });
    }
  }

  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [
    ...deck,
  ];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      shuffled[i],
      shuffled[j],
    ] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}

function createRoomCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 5; i++) {
    code +=
      characters[
        Math.floor(
          Math.random() *
            characters.length
        )
      ];
  }

  return code;
}

function getFirstEmptySeat(players) {
  for (let i = 0; i < 4; i++) {
    if (!players[i]) {
      return i;
    }
  }

  return -1;
}

function getNextPlayer(
  playerNumber
) {
  return playerNumber === 4
    ? 1
    : playerNumber + 1;
}

function getTeam(
  playerNumber
) {
  return (
    playerNumber === 1 ||
    playerNumber === 3
      ? 1
      : 2
  );
}

function getTeammate(
  playerNumber
) {
  if (playerNumber === 1) {
    return 3;
  }

  if (playerNumber === 2) {
    return 4;
  }

  if (playerNumber === 3) {
    return 1;
  }

  return 2;
}

function isBotPlayer(
  room,
  playerNumber
) {
  const player =
    room.players[
      playerNumber - 1
    ];

  return Boolean(
    player &&
    player.isBot
  );
}

function emitPrivateGameUpdate(
  roomCode,
  room
) {
  io.to(roomCode).emit(
    "private-game-updated",
    {
      currentTurn:
        room.currentTurn,

      playedCards:
        room.playedCards,

      trickWinner:
        room.trickWinner,

      team1Tricks:
        room.team1Tricks,

      team2Tricks:
        room.team2Tricks,

      team1Hands:
        room.team1Hands,

      team2Hands:
        room.team2Hands,

      handWinner:
        room.handWinner,

      matchWinner:
        room.matchWinner,
    }
  );
}

function sendHumanHand(
  room,
  playerIndex
) {
  const player =
    room.players[
      playerIndex
    ];

  if (
    !player ||
    player.isBot
  ) {
    return;
  }

  io.to(player.id).emit(
    "private-hand-updated",
    {
      hand:
        room.hands[
          playerIndex
        ],

      currentTurn:
        room.currentTurn,

      phase:
        room.phase,
    }
  );
}

function sendAllHumanHands(
  room
) {
  room.players.forEach(
    (player, index) => {
      if (
        !player ||
        player.isBot
      ) {
        return;
      }

      sendHumanHand(
        room,
        index
      );
    }
  );
}

function createEmptyVoidSuits() {
  return {
    1: [],
    2: [],
    3: [],
    4: [],
  };
}

function rememberVoidSuit(
  room,
  playerNumber,
  suit
) {
  if (!room.voidSuits) {
    room.voidSuits =
      createEmptyVoidSuits();
  }

  if (
    !room.voidSuits[
      playerNumber
    ].includes(suit)
  ) {
    room.voidSuits[
      playerNumber
    ].push(suit);
  }
}

function chooseBestHokm(
  cards
) {
  const rankValues = {
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

  let bestSuit =
    "spades";

  let bestCount =
    -1;

  let bestStrength =
    -1;

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
        (
          total,
          card
        ) =>
          total +
          rankValues[
            card.rank
          ],
        0
      );

    if (
      count > bestCount ||
      (
        count === bestCount &&
        strength >
          bestStrength
      )
    ) {
      bestSuit =
        suit;

      bestCount =
        count;

      bestStrength =
        strength;
    }
  }

  return bestSuit;
}

function chooseBotCard(
  room,
  botPlayer
) {
  const hand =
    room.hands[
      botPlayer - 1
    ];

  if (
    !hand ||
    hand.length === 0 ||
    !room.hokm
  ) {
    return null;
  }

  const hokm =
    room.hokm;

  function sortLowToHigh(
    cards
  ) {
    return [
      ...cards,
    ].sort(
      (
        a,
        b
      ) =>
        getCardValue(a) -
        getCardValue(b)
    );
  }

  /*
    BOT IS LEADING
  */

  if (
    room.playedCards.length ===
    0
  ) {
    const teammate =
      getTeammate(
        botPlayer
      );

    const knownVoidSuits =
      room.voidSuits?.[
        teammate
      ] ?? [];

    const usefulLeadCards =
      hand.filter(
        card =>
          knownVoidSuits.includes(
            card.suit
          ) &&
          card.suit !==
            hokm
      );

    if (
      usefulLeadCards.length >
      0
    ) {
      return sortLowToHigh(
        usefulLeadCards
      )[0];
    }

    const nonHokmCards =
      hand.filter(
        card =>
          card.suit !==
          hokm
      );

    if (
      nonHokmCards.length >
      0
    ) {
      return sortLowToHigh(
        nonHokmCards
      )[0];
    }

    return sortLowToHigh(
      hand
    )[0];
  }

  const leadSuit =
    room.playedCards[0]
      .card.suit;

  const currentWinner =
    determineTrickWinner(
      room.playedCards,
      leadSuit,
      hokm
    );

  const botTeam =
    getTeam(
      botPlayer
    );

  const winnerTeam =
    getTeam(
      currentWinner
    );

  const teammateWinning =
    botTeam ===
    winnerTeam;

  const matchingSuitCards =
    hand.filter(
      card =>
        card.suit ===
        leadSuit
    );

  /*
    MUST FOLLOW SUIT
  */

  if (
    matchingSuitCards.length >
    0
  ) {
    const sortedMatching =
      sortLowToHigh(
        matchingSuitCards
      );

    if (
      teammateWinning
    ) {
      return (
        sortedMatching[0]
      );
    }

    for (
      const card
      of sortedMatching
    ) {
      const testTrick = [
        ...room.playedCards,
        {
          player:
            botPlayer,

          card,
        },
      ];

      const testWinner =
        determineTrickWinner(
          testTrick,
          leadSuit,
          hokm
        );

      if (
        testWinner ===
        botPlayer
      ) {
        return card;
      }
    }

    return (
      sortedMatching[0]
    );
  }

  /*
    BOT CANNOT FOLLOW SUIT
  */

  const hokmCards =
    sortLowToHigh(
      hand.filter(
        card =>
          card.suit ===
          hokm
      )
    );

  const nonHokmCards =
    sortLowToHigh(
      hand.filter(
        card =>
          card.suit !==
          hokm
      )
    );

  if (
    teammateWinning
  ) {
    if (
      nonHokmCards.length >
      0
    ) {
      return (
        nonHokmCards[0]
      );
    }

    return (
      hokmCards[0] ??
      null
    );
  }

  /*
    Try weakest Hokm
    that can win.
  */

  for (
    const card
    of hokmCards
  ) {
    const testTrick = [
      ...room.playedCards,
      {
        player:
          botPlayer,

        card,
      },
    ];

    const testWinner =
      determineTrickWinner(
        testTrick,
        leadSuit,
        hokm
      );

    if (
      testWinner ===
      botPlayer
    ) {
      return card;
    }
  }

  if (
    nonHokmCards.length >
    0
  ) {
    return (
      nonHokmCards[0]
    );
  }

  return (
    hokmCards[0] ??
    null
  );
}

function applyCardPlay(
  roomCode,
  room,
  playerNumber,
  selectedCard
) {
  if (
    !room ||
    room.phase !==
      "playing" ||
    !room.hokm ||
    room.handWinner !==
      null ||
    room.matchWinner !==
      null ||
    room.playedCards.length >=
      4 ||
    room.currentTurn !==
      playerNumber
  ) {
    return false;
  }

  const playerIndex =
    playerNumber - 1;

  const hand =
    room.hands[
      playerIndex
    ];

  const cardIndex =
    hand.findIndex(
      card =>
        card.suit ===
          selectedCard.suit &&
        card.rank ===
          selectedCard.rank
    );

  if (
    cardIndex === -1
  ) {
    return false;
  }

  const actualCard =
    hand[
      cardIndex
    ];

  /*
    FOLLOW SUIT
  */

  if (
    room.playedCards.length >
    0
  ) {
    const leadSuit =
      room.playedCards[0]
        .card.suit;

    const hasLeadSuit =
      hand.some(
        card =>
          card.suit ===
          leadSuit
      );

    if (
      hasLeadSuit &&
      actualCard.suit !==
        leadSuit
    ) {
      return false;
    }

    if (
      !hasLeadSuit &&
      actualCard.suit !==
        leadSuit
    ) {
      rememberVoidSuit(
        room,
        playerNumber,
        leadSuit
      );
    }
  }

  hand.splice(
    cardIndex,
    1
  );

  room.playedCards.push(
    {
      player:
        playerNumber,

      card:
        actualCard,
    }
  );

  /*
    FINISH TRICK
  */

  if (
    room.playedCards.length ===
    4
  ) {
    const leadSuit =
      room.playedCards[0]
        .card.suit;

    const winner =
      determineTrickWinner(
        room.playedCards,
        leadSuit,
        room.hokm
      );

    room.trickWinner =
      winner;

    room.currentTurn =
      null;

    if (
      getTeam(
        winner
      ) === 1
    ) {
      room.team1Tricks +=
        1;
    } else {
      room.team2Tricks +=
        1;
    }

    /*
      HAND WINNER
    */

    if (
      room.team1Tricks >=
        7 &&
      room.handWinner ===
        null
    ) {
      room.handWinner =
        1;

      room.team1Hands +=
        1;

      room.nextHakemPlayer =
        winner;
    }

    if (
      room.team2Tricks >=
        7 &&
      room.handWinner ===
        null
    ) {
      room.handWinner =
        2;

      room.team2Hands +=
        1;

      room.nextHakemPlayer =
        winner;
    }

    /*
      MATCH WINNER
    */

    if (
      room.team1Hands >=
      7
    ) {
      room.matchWinner =
        1;
    }

    if (
      room.team2Hands >=
      7
    ) {
      room.matchWinner =
        2;
    }

  } else {

    room.currentTurn =
      getNextPlayer(
        playerNumber
      );
  }

  /*
    Only human players
    need their private hand
    sent back.
  */

  sendHumanHand(
    room,
    playerIndex
  );

  emitPrivateGameUpdate(
    roomCode,
    room
  );

  console.log(
    `Player ${playerNumber}${
      isBotPlayer(
        room,
        playerNumber
      )
        ? " (Bot)"
        : ""
    } played ${actualCard.rank} of ${actualCard.suit}`
  );

  if (
    room.matchWinner !==
    null
  ) {
    console.log(
      `Match won in ${roomCode} by Team ${room.matchWinner}. Final hands: ${room.team1Hands}-${room.team2Hands}`
    );
  }

  /*
    If another bot is next,
    let it play.
  */

  if (
    room.playedCards.length <
      4 &&
    room.currentTurn !==
      null
  ) {
    scheduleBotTurn(
      roomCode
    );
  }

  return true;
}

function scheduleBotTurn(
  roomCode
) {
  const room =
    rooms[
      roomCode
    ];

  if (
    !room ||
    room.phase !==
      "playing" ||
    room.currentTurn ===
      null ||
    room.handWinner !==
      null ||
    room.matchWinner !==
      null ||
    room.trickWinner !==
      null ||
    !isBotPlayer(
      room,
      room.currentTurn
    ) ||
    room.botTurnScheduled
  ) {
    return;
  }

  room.botTurnScheduled =
    true;

  setTimeout(() => {
    const latestRoom =
      rooms[
        roomCode
      ];

    if (!latestRoom) {
      return;
    }

    latestRoom.botTurnScheduled =
      false;

    if (
      latestRoom.phase !==
        "playing" ||
      latestRoom.currentTurn ===
        null ||
      latestRoom.handWinner !==
        null ||
      latestRoom.matchWinner !==
        null ||
      latestRoom.trickWinner !==
        null ||
      !isBotPlayer(
        latestRoom,
        latestRoom.currentTurn
      )
    ) {
      return;
    }

    const botPlayer =
      latestRoom.currentTurn;

    const card =
      chooseBotCard(
        latestRoom,
        botPlayer
      );

    if (!card) {
      console.error(
        `Bot Player ${botPlayer} has no legal card in room ${roomCode}`
      );

      return;
    }

    applyCardPlay(
      roomCode,
      latestRoom,
      botPlayer,
      card
    );

  }, 700);
}

function applyHokmChoice(
  roomCode,
  room,
  suit
) {
  if (
    !room ||
    room.phase !==
      "choose-hokm" ||
    room.hokm ||
    room.matchWinner !==
      null ||
    !suits.includes(
      suit
    )
  ) {
    return false;
  }

  room.hokm =
    suit;

  /*
    Fill all hands
    to 13 cards.
  */

  for (
    let player = 0;
    player < 4;
    player++
  ) {
    while (
      room.hands[
        player
      ].length < 13
    ) {
      const card =
        room.deck.shift();

      if (!card) {
        break;
      }

      room.hands[
        player
      ].push(card);
    }
  }

  room.phase =
    "playing";

  room.currentTurn =
    room.hakemPlayer;

  room.playedCards =
    [];

  room.trickWinner =
    null;

  io.to(roomCode).emit(
    "hokm-chosen",
    {
      suit,

      hakemPlayer:
        room.hakemPlayer,
    }
  );

  sendAllHumanHands(
    room
  );

  emitPrivateGameUpdate(
    roomCode,
    room
  );

  console.log(
    `Hokm chosen in ${roomCode}: ${suit} by Player ${room.hakemPlayer}${
      isBotPlayer(
        room,
        room.hakemPlayer
      )
        ? " (Bot)"
        : ""
    }`
  );

  /*
    If Hâkem is a bot,
    it now leads.
  */

  scheduleBotTurn(
    roomCode
  );

  return true;
}

function scheduleBotHokmChoice(
  roomCode
) {
  const room =
    rooms[
      roomCode
    ];

  if (
    !room ||
    room.phase !==
      "choose-hokm" ||
    room.hokm ||
    room.matchWinner !==
      null ||
    !isBotPlayer(
      room,
      room.hakemPlayer
    ) ||
    room.botHokmScheduled
  ) {
    return;
  }

  room.botHokmScheduled =
    true;

  setTimeout(() => {
    const latestRoom =
      rooms[
        roomCode
      ];

    if (!latestRoom) {
      return;
    }

    latestRoom.botHokmScheduled =
      false;

    if (
      latestRoom.phase !==
        "choose-hokm" ||
      latestRoom.hokm ||
      latestRoom.matchWinner !==
        null ||
      !isBotPlayer(
        latestRoom,
        latestRoom.hakemPlayer
      )
    ) {
      return;
    }

    const firstFive =
      latestRoom.hands[
        latestRoom.hakemPlayer -
        1
      ];

    const botHokm =
      chooseBestHokm(
        firstFive
      );

    applyHokmChoice(
      roomCode,
      latestRoom,
      botHokm
    );

  }, 700);
}






function removeFromOnlineQueue(
  socketId
) {
  const index =
    onlineQueue.findIndex(
      player =>
        player.socketId ===
        socketId
    );

  if (index !== -1) {
    onlineQueue.splice(
      index,
      1
    );
  }
}

function tryCreateOnlineMatch() {
  if (
    onlineQueue.length < 4
  ) {
    return;
  }

  const matchedPlayers =
    onlineQueue.splice(
      0,
      4
    );

  let roomCode =
    `ONLINE-${Date.now()}`;

  while (
    rooms[roomCode]
  ) {
    roomCode =
      `ONLINE-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
  }

  rooms[roomCode] = {
    host: null,

    isOnlineMatch: true,

    players:
      matchedPlayers.map(
        player => ({
          id:
            player.socketId,

          name:
            player.name,

          isBot:
            false,
        })
      ),
  };

  const room =
    rooms[roomCode];

  matchedPlayers.forEach(
    player => {
      const playerSocket =
        io.sockets.sockets.get(
          player.socketId
        );

      if (!playerSocket) {
        return;
      }

      playerSocket.join(
        roomCode
      );

      playerSocket.data.roomCode =
        roomCode;
    }
  );

  startOnlineRoom(
    roomCode
  );
}





function startOnlineRoom(
  roomCode
) {
  const room =
    rooms[roomCode];

  if (!room) {
    return;
  }

  room.hakemPlayer = 1;
  room.nextHakemPlayer = 1;

  room.team1Hands = 0;
  room.team2Hands = 0;

  room.team1Tricks = 0;
  room.team2Tricks = 0;

  room.handWinner = null;
  room.matchWinner = null;

  room.trickWinner = null;
  room.collectingTrick = false;
  room.currentTurn = null;
  room.playedCards = [];

  room.voidSuits =
    createEmptyVoidSuits();

  room.botTurnScheduled =
    false;

  room.botHokmScheduled =
    false;

  const deck =
    shuffleDeck(
      createDeck()
    );

  const firstFive =
    deck.slice(
      0,
      5
    );

  room.deck =
    deck.slice(5);

  room.hands = [
    [],
    [],
    [],
    [],
  ];

  room.hands[
    room.hakemPlayer - 1
  ] =
    firstFive;

  room.hokm = null;
  room.phase =
    "choose-hokm";

  room.players.forEach(
    (
      player,
      index
    ) => {
      if (!player) {
        return;
      }

      io.to(
        player.id
      ).emit(
        "online-game-started",
        {
          roomCode,

          playerNumber:
            index + 1,

          hakemPlayer:
            room.hakemPlayer,

          hand:
            room.hands[
              index
            ],

          phase:
            room.phase,

          players:
            room.players,
        }
      );
    }
  );

  emitPrivateGameUpdate(
    roomCode,
    room
  );

  console.log(
    `Online match started: ${roomCode}`
  );
}






io.on(
  "connection",
  socket => {

    console.log(
      "Player connected:",
      socket.id
    );




// =========================
// JOIN ONLINE MATCHMAKING
// =========================

socket.on(
  "join-online",
  ({ name }) => {

    const cleanName =
      String(
        name ?? ""
      )
        .trim()
        .slice(0, 16);

    if (!cleanName) {
      socket.emit(
        "online-error",
        "Please enter a name."
      );

      return;
    }

    const alreadyQueued =
      onlineQueue.some(
        player =>
          player.socketId ===
          socket.id
      );

    if (
      alreadyQueued
    ) {
      return;
    }

    onlineQueue.push({
      socketId:
        socket.id,

      name:
        cleanName,
    });

    socket.emit(
      "online-queue-update",
      {
        position:
          onlineQueue.length,

        playersWaiting:
          onlineQueue.length,
      }
    );

    io.emit(
      "online-queue-count",
      onlineQueue.length
    );

    console.log(
      `${cleanName} joined online queue`
    );

    tryCreateOnlineMatch();
  }
);





// =========================
// LEAVE ONLINE MATCHMAKING
// =========================

socket.on(
  "leave-online",
  () => {
    removeFromOnlineQueue(
      socket.id
    );

    io.emit(
      "online-queue-count",
      onlineQueue.length
    );
  }
);





    // =========================
    // CREATE ROOM
    // =========================

 socket.on(
  "create-room",
  ({ name }) => {

    let roomCode =
      createRoomCode();

    while (
      rooms[roomCode]
    ) {
      roomCode =
        createRoomCode();
    }

    const cleanName =
      String(name ?? "")
        .trim()
        .slice(0, 16);

    rooms[roomCode] = {
      host:
        socket.id,

      players: [
        {
          id:
            socket.id,

          name:
            cleanName ||
            "Host",

          isBot:
            false,
        },
      ],
    };

    socket.join(
      roomCode
    );

    socket.data.roomCode =
      roomCode;

    socket.emit(
      "room-created",
      roomCode
    );

    io.to(
      roomCode
    ).emit(
      "room-updated",
      rooms[roomCode]
    );

    console.log(
      `Room created: ${roomCode} by ${cleanName || "Host"}`
    );
  }
);
    // =========================
    // JOIN ROOM
    // =========================

socket.on(
  "join-room",
  ({
    roomCode:
      rawRoomCode,
    name,
  }) => {

    const roomCode =
      String(
        rawRoomCode ?? ""
      )
        .trim()
        .toUpperCase();

    const cleanName =
      String(name ?? "")
        .trim()
        .slice(0, 16);

    const room =
      rooms[roomCode];

    if (!room) {
      socket.emit(
        "join-error",
        "Room not found."
      );

      return;
    }

    if (!cleanName) {
      socket.emit(
        "join-error",
        "Please enter a name."
      );

      return;
    }

    const alreadyJoined =
      room.players.some(
        player =>
          player &&
          player.id ===
            socket.id
      );

    if (
      alreadyJoined
    ) {
      return;
    }

    const emptySeat =
      getFirstEmptySeat(
        room.players
      );

    if (
      emptySeat === -1
    ) {
      socket.emit(
        "join-error",
        "Room is full."
      );

      return;
    }

    room.players[
      emptySeat
    ] = {
      id:
        socket.id,

      name:
        cleanName,

      isBot:
        false,
    };

    socket.join(
      roomCode
    );

    socket.data.roomCode =
      roomCode;

    io.to(
      roomCode
    ).emit(
      "room-updated",
      room
    );

    console.log(
      `${cleanName} joined ${roomCode} as Player ${
        emptySeat + 1
      }`
    );
  }
);


// =========================
// SWAP LOBBY SEATS
// =========================

socket.on(
  "swap-seats",
  ({
    roomCode,
    firstIndex,
    secondIndex,
  }) => {
    const room =
      rooms[roomCode];

    if (!room) {
      return;
    }

    // Only the host can swap seats.
    if (
      room.host !==
      socket.id
    ) {
      return;
    }

    // Only allow swapping
    // before the game starts.
    if (
      room.phase
    ) {
      return;
    }

    if (
      firstIndex < 0 ||
      firstIndex > 3 ||
      secondIndex < 0 ||
      secondIndex > 3 ||
      firstIndex ===
        secondIndex
    ) {
      return;
    }

    const firstPlayer =
      room.players[
        firstIndex
      ];

    const secondPlayer =
      room.players[
        secondIndex
      ];

    // Both seats must be occupied.
    if (
      !firstPlayer ||
      !secondPlayer
    ) {
      return;
    }

    room.players[
      firstIndex
    ] =
      secondPlayer;

    room.players[
      secondIndex
    ] =
      firstPlayer;

    /*
      If the host moved,
      room.host stays as the
      same socket ID, which is
      exactly what we want.
    */

    io.to(
      roomCode
    ).emit(
      "room-updated",
      room
    );

    console.log(
      `Seats swapped in ${roomCode}: Player ${
        firstIndex + 1
      } <-> Player ${
        secondIndex + 1
      }`
    );
  }
);



    // =========================
    // ADD BOT
    // =========================

    socket.on(
      "add-bot",
      ({
        roomCode,
        seatIndex,
      }) => {

        const room =
          rooms[
            roomCode
          ];

        if (!room) {
          return;
        }

        if (
          room.host !==
          socket.id
        ) {
          return;
        }

        if (
          seatIndex < 0 ||
          seatIndex > 3
        ) {
          return;
        }

        if (
          room.players[
            seatIndex
          ]
        ) {
          return;
        }

        room.players[
          seatIndex
        ] = {
          id:
            `bot-${roomCode}-${seatIndex}`,

          name:
            `Bot ${
              seatIndex + 1
            }`,

          isBot:
            true,
        };

        io.to(
          roomCode
        ).emit(
          "room-updated",
          room
        );

        console.log(
          `Bot added to ${roomCode}, seat ${
            seatIndex + 1
          }`
        );
      }
    );

    // =========================
    // REMOVE BOT
    // =========================

    socket.on(
      "remove-bot",
      ({
        roomCode,
        seatIndex,
      }) => {

        const room =
          rooms[
            roomCode
          ];

        if (!room) {
          return;
        }

        if (
          room.host !==
          socket.id
        ) {
          return;
        }

        const player =
          room.players[
            seatIndex
          ];

        if (
          !player ||
          !player.isBot
        ) {
          return;
        }

        room.players[
          seatIndex
        ] =
          undefined;

        io.to(
          roomCode
        ).emit(
          "room-updated",
          room
        );

        console.log(
          `Bot removed from ${roomCode}, seat ${
            seatIndex + 1
          }`
        );
      }
    );

    // =========================
    // START GAME
    // =========================

    socket.on(
      "start-game",
      roomCode => {

        const room =
          rooms[
            roomCode
          ];

        if (!room) {
          return;
        }

        if (
          room.host !==
          socket.id
        ) {
          return;
        }

        const allSeatsFilled =
          [
            0,
            1,
            2,
            3,
          ].every(
            index =>
              Boolean(
                room.players[
                  index
                ]
              )
          );

        if (
          !allSeatsFilled
        ) {
          return;
        }

        room.hakemPlayer =
          1;

        room.nextHakemPlayer =
          1;

        room.team1Hands =
          0;

        room.team2Hands =
          0;

        room.team1Tricks =
          0;

        room.team2Tricks =
          0;

        room.handWinner =
          null;

        room.matchWinner =
          null;

        room.trickWinner =
          null;

        room.collectingTrick =
          false;

        room.currentTurn =
          null;

        room.playedCards =
          [];

        room.voidSuits =
          createEmptyVoidSuits();

        room.botTurnScheduled =
          false;

        room.botHokmScheduled =
          false;

        const deck =
          shuffleDeck(
            createDeck()
          );

        const firstFive =
          deck.slice(
            0,
            5
          );

        room.deck =
          deck.slice(5);

        room.hands = [
          [],
          [],
          [],
          [],
        ];

        room.hands[
          room.hakemPlayer -
          1
        ] =
          firstFive;

        room.hokm =
          null;

        room.phase =
          "choose-hokm";

        io.to(
          roomCode
        ).emit(
          "enter-private-game",
          {
            roomCode,
          }
        );

        room.players.forEach(
          (
            player,
            index
          ) => {

            if (
              !player ||
              player.isBot
            ) {
              return;
            }

            io.to(
              player.id
            ).emit(
              "game-started",
              {
                playerNumber:
                  index + 1,

                hakemPlayer:
                  room.hakemPlayer,

                roomCode,

                hand:
                  room.hands[
                    index
                  ],

                phase:
                  room.phase,
              }
            );
          }
        );

        emitPrivateGameUpdate(
          roomCode,
          room
        );

        console.log(
          `Game started in room ${roomCode}`
        );

        scheduleBotHokmChoice(
          roomCode
        );
      }
    );

    // =========================
    // CHOOSE HOKM
    // =========================

    socket.on(
      "choose-hokm",
      ({
        roomCode,
        suit,
      }) => {

        const room =
          rooms[
            roomCode
          ];

        if (!room) {
          return;
        }

        const playerIndex =
          room.players.findIndex(
            player =>
              player &&
              player.id ===
                socket.id
          );

        if (
          playerIndex ===
          -1
        ) {
          return;
        }

        const playerNumber =
          playerIndex + 1;

        if (
          playerNumber !==
            room.hakemPlayer ||
          isBotPlayer(
            room,
            playerNumber
          )
        ) {
          return;
        }

        applyHokmChoice(
          roomCode,
          room,
          suit
        );
      }
    );

    // =========================
    // PLAY CARD
    // =========================

    socket.on(
      "play-card",
      ({
        roomCode,
        suit,
        rank,
      }) => {

        const room =
          rooms[
            roomCode
          ];

        if (!room) {
          return;
        }

        const playerIndex =
          room.players.findIndex(
            player =>
              player &&
              player.id ===
                socket.id
          );

        if (
          playerIndex ===
          -1
        ) {
          return;
        }

        const playerNumber =
          playerIndex + 1;

        if (
          isBotPlayer(
            room,
            playerNumber
          )
        ) {
          return;
        }

        applyCardPlay(
          roomCode,
          room,
          playerNumber,
          {
            suit,
            rank,
          }
        );
      }
    );

    // =========================
    // NEXT TRICK
    // =========================

    socket.on(
      "next-trick",
      roomCode => {

        const room =
          rooms[
            roomCode
          ];

        if (
          !room ||
          room.trickWinner ===
            null ||
          room.collectingTrick ||
          room.handWinner !==
            null ||
          room.matchWinner !==
            null
        ) {
          return;
        }

        const winner =
          room.trickWinner;

        room.collectingTrick =
          true;

        io.to(
          roomCode
        ).emit(
          "collect-trick",
          {
            winner,
          }
        );

        setTimeout(
          () => {

            const latestRoom =
              rooms[
                roomCode
              ];

            if (
              !latestRoom
            ) {
              return;
            }

            latestRoom.playedCards =
              [];

            latestRoom.trickWinner =
              null;

            latestRoom.currentTurn =
              winner;

            latestRoom.collectingTrick =
              false;

            emitPrivateGameUpdate(
              roomCode,
              latestRoom
            );

            /*
              If the winner
              is a bot, it
              leads automatically.
            */

            scheduleBotTurn(
              roomCode
            );

          },
          450
        );
      }
    );

    // =========================
    // NEXT HAND
    // =========================

    socket.on(
      "next-hand",
      roomCode => {

        const room =
          rooms[
            roomCode
          ];

        if (
          !room ||
          room.handWinner ===
            null ||
          room.matchWinner !==
            null
        ) {
          return;
        }

        room.team1Tricks =
          0;

        room.team2Tricks =
          0;

        room.trickWinner =
          null;

        room.handWinner =
          null;

        room.playedCards =
          [];

        room.collectingTrick =
          false;

        room.currentTurn =
          null;

        room.voidSuits =
          createEmptyVoidSuits();

        room.botTurnScheduled =
          false;

        room.botHokmScheduled =
          false;

        room.hakemPlayer =
          room.nextHakemPlayer ??
          room.hakemPlayer ??
          1;

        const deck =
          shuffleDeck(
            createDeck()
          );

        const firstFive =
          deck.slice(
            0,
            5
          );

        room.deck =
          deck.slice(5);

        room.hands = [
          [],
          [],
          [],
          [],
        ];

        room.hands[
          room.hakemPlayer -
          1
        ] =
          firstFive;

        room.hokm =
          null;

        room.phase =
          "choose-hokm";

        room.players.forEach(
          (
            player,
            index
          ) => {

            if (
              !player ||
              player.isBot
            ) {
              return;
            }

            io.to(
              player.id
            ).emit(
              "new-private-hand",
              {
                hand:
                  room.hands[
                    index
                  ],

                hakemPlayer:
                  room.hakemPlayer,

                team1Hands:
                  room.team1Hands,

                team2Hands:
                  room.team2Hands,

                matchWinner:
                  room.matchWinner,
              }
            );
          }
        );

        emitPrivateGameUpdate(
          roomCode,
          room
        );

        console.log(
          `New hand started in ${roomCode}. Hâkem: Player ${room.hakemPlayer}. Hands: ${room.team1Hands}-${room.team2Hands}`
        );

        /*
          If the new Hâkem
          is a bot, it chooses
          Hokm automatically.
        */

        scheduleBotHokmChoice(
          roomCode
        );
      }
    );

    // =========================
    // DISCONNECT
    // =========================

    socket.on(
      "disconnect",
      () => {
        /*
          If the player was still
          searching for an online
          match, remove them from
          the matchmaking queue.
        */

        removeFromOnlineQueue(
          socket.id
        );

        /*
          Update everybody who is
          still waiting in the
          online queue.
        */

        io.emit(
          "online-queue-count",
          onlineQueue.length
        );

        console.log(
          "Player disconnected:",
          socket.id
        );

        const roomCode =
          socket.data.roomCode;

        /*
          A player who was only
          matchmaking may not have
          a room yet.
        */

        if (!roomCode) {
          return;
        }

        const room =
          rooms[
            roomCode
          ];

        if (!room) {
          return;
        }

        const playerIndex =
          room.players.findIndex(
            player =>
              player &&
              player.id ===
                socket.id
          );

        if (
          playerIndex === -1
        ) {
          return;
        }

        const playerNumber =
          playerIndex + 1;

        const wasGameActive =
          room.phase ===
            "playing" ||
          room.phase ===
            "choose-hokm";

        /*
          DURING AN ACTIVE GAME:
          replace the disconnected
          human with a bot in the
          same seat.

          This keeps:
          - the same team
          - the same hand
          - the same Hâkem seat
          - the same turn order
        */

        if (wasGameActive) {
          room.players[
            playerIndex
          ] = {
            id:
              `bot-${roomCode}-${playerIndex}`,

            name:
              `Bot ${
                playerNumber
              }`,

            isBot:
              true,
          };

          console.log(
            `Player ${playerNumber} disconnected from ${roomCode} and was replaced by a bot.`
          );
        } else {
          /*
            BEFORE THE GAME STARTS:
            simply make the seat
            empty again.
          */

          room.players[
            playerIndex
          ] =
            undefined;

          console.log(
            `Player ${playerNumber} left lobby ${roomCode}.`
          );
        }

        /*
          Find the humans who are
          still in the room after
          the replacement/removal.
        */

        const humanPlayers =
          room.players.filter(
            player =>
              player &&
              !player.isBot
          );

        /*
          If every human has left,
          there is no reason to keep
          a bots-only room alive.
        */

        if (
          humanPlayers.length ===
          0
        ) {
          delete rooms[
            roomCode
          ];

          console.log(
            `Room deleted: ${roomCode}`
          );

          return;
        }

        /*
          PRIVATE LOBBY / PRIVATE GAME:
          if the host disconnected,
          transfer host status to
          the first remaining human.

          Online matchmaking rooms
          have host: null, so this
          does nothing for them.
        */

        if (
          room.host ===
          socket.id
        ) {
          const nextHost =
            humanPlayers[0];

          room.host =
            nextHost.id;

          console.log(
            `Host transferred in ${roomCode} to ${nextHost.name}.`
          );
        }

        /*
          Tell all remaining clients
          that the seat/player list
          has changed.
        */

        io.to(
          roomCode
        ).emit(
          "room-updated",
          room
        );

        /*
          Also resend the shared game
          state during an active match.
        */

        if (wasGameActive) {
          emitPrivateGameUpdate(
            roomCode,
            room
          );
        }

        /*
          If the disconnected player
          was Hâkem and had not chosen
          Hokm yet, the replacement
          bot should choose it.
        */

        if (
          wasGameActive &&
          room.phase ===
            "choose-hokm" &&
          room.hakemPlayer ===
            playerNumber
        ) {
          scheduleBotHokmChoice(
            roomCode
          );

          return;
        }

        /*
          If it was the disconnected
          player's turn, the replacement
          bot should immediately take
          over that turn.
        */

        if (
          wasGameActive &&
          room.phase ===
            "playing" &&
          room.currentTurn ===
            playerNumber &&
          room.trickWinner ===
            null &&
          room.handWinner ===
            null &&
          room.matchWinner ===
            null
        ) {
          scheduleBotTurn(
            roomCode
          );
        }
      }
    );
  }
);


httpServer.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Hokm multiplayer server running on port ${PORT}`
    );
  }
);