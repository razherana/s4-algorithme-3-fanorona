import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <svg className="pl" width={240} height={240} viewBox="0 0 240 240">
        <circle
          className="pl__ring pl__ring--a"
          cx={120}
          cy={120}
          r={105}
          fill="none"
          stroke="#000"
          strokeWidth={20}
          strokeDasharray="0 660"
          strokeDashoffset={-330}
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--b"
          cx={120}
          cy={120}
          r={35}
          fill="none"
          stroke="#000"
          strokeWidth={20}
          strokeDasharray="0 220"
          strokeDashoffset={-110}
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--c"
          cx={85}
          cy={120}
          r={70}
          fill="none"
          stroke="#000"
          strokeWidth={20}
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--d"
          cx={155}
          cy={120}
          r={70}
          fill="none"
          stroke="#000"
          strokeWidth={20}
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
      </svg>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .pl {
    width: 6em;
    height: 6em;
  }

  .pl__ring {
    animation: ringA 2s linear infinite;
  }

  .pl__ring--a {
    stroke: #f42f25;
  }

  .pl__ring--b {
    animation-name: ringB;
    stroke: #f49725;
  }

  .pl__ring--c {
    animation-name: ringC;
    stroke: #255ff4;
  }

  .pl__ring--d {
    animation-name: ringD;
    stroke: #f42582;
  }

  /* Animations */
  @keyframes ringA {
    from,
    4% {
      stroke-dasharray: 0 660;
      stroke-width: 20;
      stroke-dashoffset: -330;
    }

    12% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -335;
    }

    32% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -595;
    }

    40%,
    54% {
      stroke-dasharray: 0 660;
      stroke-width: 20;
      stroke-dashoffset: -660;
    }

    62% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -665;
    }

    82% {
      stroke-dasharray: 60 600;
      stroke-width: 30;
      stroke-dashoffset: -925;
    }

    90%,
    to {
      stroke-dasharray: 0 660;
      stroke-width: 20;
      stroke-dashoffset: -990;
    }
  }

  @keyframes ringB {
    from,
    12% {
      stroke-dasharray: 0 220;
      stroke-width: 20;
      stroke-dashoffset: -110;
    }

    20% {
      stroke-dasharray: 20 200;
      stroke-width: 30;
      stroke-dashoffset: -115;
    }

    40% {
      stroke-dasharray: 20 200;
      stroke-width: 30;
      stroke-dashoffset: -195;
    }

    48%,
    62% {
      stroke-dasharray: 0 220;
      stroke-width: 20;
      stroke-dashoffset: -220;
    }

    70% {
      stroke-dasharray: 20 200;
      stroke-width: 30;
      stroke-dashoffset: -225;
    }

    90% {
      stroke-dasharray: 20 200;
      stroke-width: 30;
      stroke-dashoffset: -305;
    }

    98%,
    to {
      stroke-dasharray: 0 220;
      stroke-width: 20;
      stroke-dashoffset: -330;
    }
  }

  @keyframes ringC {
    from {
      stroke-dasharray: 0 440;
      stroke-width: 20;
      stroke-dashoffset: 0;
    }

    8% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -5;
    }

    28% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -175;
    }

    36%,
    58% {
      stroke-dasharray: 0 440;
      stroke-width: 20;
      stroke-dashoffset: -220;
    }

    66% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -225;
    }

    86% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -395;
    }

    94%,
    to {
      stroke-dasharray: 0 440;
      stroke-width: 20;
      stroke-dashoffset: -440;
    }
  }

  @keyframes ringD {
    from,
    8% {
      stroke-dasharray: 0 440;
      stroke-width: 20;
      stroke-dashoffset: 0;
    }

    16% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -5;
    }

    36% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -175;
    }

    44%,
    50% {
      stroke-dasharray: 0 440;
      stroke-width: 20;
      stroke-dashoffset: -220;
    }

    58% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -225;
    }

    78% {
      stroke-dasharray: 40 400;
      stroke-width: 30;
      stroke-dashoffset: -395;
    }

    86%,
    to {
      stroke-dasharray: 0 440;
      stroke-width: 20;
      stroke-dashoffset: -440;
    }
  }
`;

const isAutomatic = true;

const Fanorona3 = () => {
  // Game states
  const [loading, setLoading] = useState(false);
  const [gamePhase, setGamePhase] = useState("placement"); // 'placement' or 'movement'
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [winner, setWinner] = useState(null);

  const [dashedOutsideHelp, setDashedOutsideHelp] = useState([]);
  const [normalHelp, setNormalHelp] = useState([]);

  // Track how many pieces each player has placed
  const [piecesPlaced, setPiecesPlaced] = useState({ 1: 0, 2: 0 });

  // Board state - null means empty, 1 means player 1, 2 means player 2
  const [board, setBoard] = useState({
    "0,0": null,
    "0,1": null,
    "0,2": null,
    "1,0": null,
    "1,1": null,
    "1,2": null,
    "2,0": null,
    "2,1": null,
    "2,2": null,
  });

  useEffect(() => {
    setPiecesPlaced(() => ({
      1: Object.values(board).filter((v) => v === 1).length,
      2: Object.values(board).filter((v) => v === 2).length,
    }));

    if (
      Object.values(board).filter((v) => v !== null && v !== -1).length >= 6
    ) {
      setGamePhase("movement");
    }
  }, [board]);

  useEffect(() => {
    // Reset help arrays when game state changes
    setNormalHelp([]);
    setDashedOutsideHelp([]);
  }, [board]);

  const askNextMove = useCallback(() => {
    if (winner) return;

    const playerId = currentPlayer;

    setLoading(true);

    axios
      .post(
        "http://localhost:5000/next_move",
        { playerId, board, state: gamePhase },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setLoading(false);
        if (response.status !== 200) {
          console.error("Error fetching next move:", response.statusText);
          alert(`Error fetching next move, ${response.statusText}`);
          return;
        }

        if (response.data.error) {
          console.error("Error in response:", response.data.error);
          alert(`Error in response, ${response.data.error}`);
          return;
        }

        const {
          best_move,
          state, // For 'placement' phase
          from,
          to, // For 'movement' phase
        } = response.data;

        if (best_move && state === "placement") {
          setBoard((prev) => {
            let a = {
              ...prev,
              [best_move]: currentPlayer,
            };
            console.log(a);
            return a;
          });
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          console.log("Best move:", best_move);
        } else {
          setBoard((prev) => {
            let a = {
              ...prev,
              [String(from)]: null,
              [String(to)]: currentPlayer,
            };
            console.log(a);
            return a;
          });
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);

          console.log("Best move:", from, "to", to);
        }
      })
      .catch((error) => {
        console.error("Error fetching next move:", error);
        setLoading(false);
      });
  }, [board, currentPlayer, gamePhase, winner]);

  useEffect(() => {
    if (isAutomatic && currentPlayer === 2) {
      askNextMove();
    }
  }, [askNextMove, currentPlayer]);

  // All possible positions on the board
  const positions = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ];

  // Define lines connecting positions
  const lines = useMemo(
    () => [
      // Horizontal lines
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      // Vertical lines
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      // Diagonal lines
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [2, 0],
        [1, 1],
        [0, 2],
      ],
    ],
    []
  );

  // Get valid adjacent positions for movement
  const getAdjacentPositions = (position) => {
    const [x, y] = position;
    const adjacentPositions = [];

    // Check all 8 directions (horizontal, vertical, diagonal)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip current position

        const newX = x + dx;
        const newY = y + dy;

        // Check if position is on the board
        if (newX >= 0 && newX <= 2 && newY >= 0 && newY <= 2) {
          // Check if there's a valid line connection
          const isValid = lines.some((line) => {
            const pointIndex = line.findIndex((p) => p[0] === x && p[1] === y);
            if (pointIndex === -1) return false;

            const nextPointIndex = line.findIndex(
              (p) => p[0] === newX && p[1] === newY
            );
            return (
              nextPointIndex !== -1 &&
              Math.abs(nextPointIndex - pointIndex) === 1
            );
          });

          if (isValid) {
            adjacentPositions.push([newX, newY]);
          }
        }
      }
    }

    return adjacentPositions;
  };

  // Check for a win condition
  const checkWin = useCallback(
    (player) => {
      for (const line of lines) {
        if (line.every(([x, y]) => board[`${x},${y}`] === player)) {
          return true;
        }
      }
      return false;
    },
    [board, lines]
  );

  // Handle clicking on a position
  const handlePositionClick = (x, y) => {
    const position = `${x},${y}`;

    if (winner) return; // Do nothing if game is over

    if (gamePhase === "placement") {
      // Place a piece if position is empty
      if (board[position] === null) {
        const newBoard = { ...board, [position]: currentPlayer };
        const newPiecesPlaced = {
          ...piecesPlaced,
          [currentPlayer]: piecesPlaced[currentPlayer] + 1,
        };

        setBoard(newBoard);
        setPiecesPlaced(newPiecesPlaced);

        // Switch player
        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(nextPlayer);

        // Check if placement phase is complete
        if (newPiecesPlaced[1] === 3 && newPiecesPlaced[2] === 3) {
          setGamePhase("movement");
        }
      }
    } else if (gamePhase === "movement") {
      // If a piece is already selected, try to move it
      if (selectedPiece !== null) {
        const [selectedX, selectedY] = selectedPiece;
        const adjacentPositions = getAdjacentPositions(selectedPiece);

        // Check if the clicked position is a valid move
        const isValid = adjacentPositions.some(
          ([adjX, adjY]) => adjX === x && adjY === y
        );

        if (isValid && board[position] === null) {
          // Move the piece
          const newBoard = { ...board };
          newBoard[`${selectedX},${selectedY}`] = null;
          newBoard[position] = currentPlayer;
          setBoard(newBoard);
          setSelectedPiece(null);

          // Switch player
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        } else {
          // Deselect if clicking on an invalid spot
          setSelectedPiece(null);
        }
      } else {
        // Select a piece if it belongs to current player
        if (board[position] === currentPlayer) {
          setSelectedPiece([x, y]);
        }
      }
    }
  };

  useEffect(() => {
    // Check for win
    const playerIds = [1, 2];

    for (let i = 0; i < playerIds.length; i++) {
      const playerId = playerIds[i];
      if (checkWin(playerId)) {
        setWinner(playerId);
        return;
      }
    }
  }, [board, checkWin]);

  // Reset game
  const resetGame = () => {
    setGamePhase("placement");
    setCurrentPlayer(1);
    setSelectedPiece(null);
    setWinner(null);
    setPiecesPlaced({ 1: 0, 2: 0 });
    setBoard({
      "0,0": null,
      "1,0": null,
      "2,0": null,
      "0,1": null,
      "1,1": null,
      "2,1": null,
      "0,2": null,
      "1,2": null,
      "2,2": null,
    });
  };

  return (
    <>
      {loading && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <Loader />
        </div>
      )}
      <div className="flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold mb-4">Fanorona 3</h1>

        <div className="mb-4">
          {winner ? (
            <div className="text-lg font-bold">
              Player {winner} wins!
              <button
                className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="text-lg">
              {gamePhase === "placement"
                ? `Player ${currentPlayer} - Place a piece (${
                    3 - piecesPlaced[currentPlayer]
                  } left)`
                : `Player ${currentPlayer} - ${
                    selectedPiece
                      ? "Choose destination"
                      : "Select a piece to move"
                  }`}
            </div>
          )}
        </div>

        <div className="relative w-64 h-64 bg-yellow-100">
          {/* Grid lines */}
          <div className="absolute inset-0 flex justify-between z-3">
            <div className="w-[3px] h-full bg-amber-600"></div>
            <div className="w-[3px] h-full bg-amber-600"></div>
            <div className="w-[3px] h-full bg-amber-600"></div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between z-3">
            <div className="w-full h-[3px] bg-amber-600"></div>
            <div className="w-full h-[3px] bg-amber-600"></div>
            <div className="w-full h-[3px] bg-amber-600"></div>
          </div>

          {/* Diagonal lines */}
          <div className="absolute inset-0">
            <svg className="w-full h-full">
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="#d97706"
                strokeWidth="2"
              />
              <line
                x1="100%"
                y1="0"
                x2="0"
                y2="100%"
                stroke="#d97706"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Intersection points */}
          {positions.map(([x, y]) => {
            const position = `${x},${y}`;
            const isPieceSelected =
              selectedPiece && selectedPiece[0] === x && selectedPiece[1] === y;

            // Determine if position is a valid move for selected piece
            let isValidMove = false;
            if (selectedPiece && gamePhase === "movement") {
              const adjacentPositions = getAdjacentPositions(selectedPiece);
              isValidMove =
                board[position] === null &&
                adjacentPositions.some(
                  ([adjX, adjY]) => adjX === x && adjY === y
                );
            }

            return board[position] === -1 ? (
              <div
                key={position}
                className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center cursor-pointer`}
                style={{
                  left: `${(x / 2) * 100}%`,
                  top: `${(y / 2) * 100}%`,
                }}
                onContextMenu={(ev) => {
                  setBoard((prevBoard) => ({
                    ...prevBoard,
                    [position]: prevBoard[position] === -1 ? null : -1,
                  }));
                  ev.preventDefault();
                }}
              >
                <div
                  className={`w-6 h-6 rounded-full ${"bg-yellow-500 border border-black"}`}
                ></div>
              </div>
            ) : (
              <div
                key={position}
                className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center cursor-pointer`}
                style={{
                  left: `${(x / 2) * 100}%`,
                  top: `${(y / 2) * 100}%`,
                  transform: `${
                    normalHelp.some((s) => `${x},${y}` === s) ||
                    dashedOutsideHelp.some((s) => `${x},${y}` === s)
                      ? "scale(2)"
                      : "scale(1)"
                  }`,
                }}
                onContextMenu={(ev) => {
                  setBoard((prevBoard) => ({
                    ...prevBoard,
                    [position]: prevBoard[position] === -1 ? null : -1,
                  }));
                  ev.preventDefault();
                }}
                onClick={(ev) => {
                  handlePositionClick(x, y);
                }}
              >
                {board[position] === null ? (
                  <div
                    className={`w-6 h-6 rounded-full ${
                      normalHelp.some((s) => `${x},${y}` === s)
                        ? "bg-red-400"
                        : dashedOutsideHelp.some((s) => `${x},${y}` === s)
                        ? "bg-red-200 bg-opacity-50 border-2 border-dashed border-red-500"
                        : isValidMove
                        ? "bg-green-200 animate-pulse"
                        : "bg-gray-300 bg-opacity-50"
                    }`}
                    onClick={(ev) => {
                      if (ev.type === "contextmenu") {
                        ev.preventDefault();
                        board[position] = board[position] === -1 ? null : -1;
                      }
                    }}
                  ></div>
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full ${
                      board[position] === 1
                        ? "bg-black"
                        : "bg-white border border-black"
                    } ${isPieceSelected ? "ring-2 ring-blue-500" : ""}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center items-center">
          <button className="bg-gray-300 px-3 py-1 rounded" onClick={resetGame}>
            Reset Game
          </button>
          <button
            className="bg-gray-300 px-3 py-1 rounded ml-4"
            onClick={askNextMove}
          >
            Ask BOT
          </button>
        </div>
      </div>
    </>
  );
};

export default Fanorona3;
