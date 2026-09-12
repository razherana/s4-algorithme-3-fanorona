from typing import Literal


class Board:
    """
    Diagonals and lines winning
    """
    LINES_WINNING = [
        # Horizontal
        ['0,0', '0,1', '0,2'],
        ['1,0', '1,1', '1,2'],
        ['2,0', '2,1', '2,2'],

        # Vertical
        ['0,0', '1,0', '2,0'],
        ['0,1', '1,1', '2,1'],
        ['0,2', '1,2', '2,2'],

        # Diagonal
        ['0,0', '1,1', '2,2'],
        ['0,2', '1,1', '2,0'],
    ]

    DEPTH = 5

    def __init__(self):
        self.board: dict[str, "int|None"] = {
            '0,0': None,
            '0,1': None,
            '0,2': None,
            '1,0': None,
            '1,1': None,
            '1,2': None,
            '2,0': None,
            '2,1': None,
            '2,2': None,
        }

        self.state = "placement"

    @staticmethod
    def is_win(board) -> int:
        # Win check
        for line in Board.LINES_WINNING:
            if board[line[0]] == board[line[1]] == board[line[2]] and board[line[0]] is not None:
                return int(board[line[0]])  # type: ignore

        # draw
        if all(v is not None for v in board.values()):
            return 0

        # still playing
        return -1

    @staticmethod
    def _possible_moves_mouvement(board: "dict[str,int|None]", player: int) -> "list[tuple[str,str]]":
        """
        Get possible moves for the player
        """
        moves = set()

        player_points = [
            point for point, value in board.items() if value == player
        ]

        for point in player_points:
            adjacent_points = Board._get_adjacent_points_static(board, point)
            for adjacent_point in adjacent_points:
                if Board.is_in_board_static(board, adjacent_point) and Board.is_valid_static(board, adjacent_point, player):
                    moves.add((point, adjacent_point))

        return list(moves)

    @staticmethod
    def _get_adjacent_points_static(board: "dict[str,int|None]", point: str) -> list[str]:
        board_ = Board()
        board_.board = board

        return board_._get_adjacent_points(point)

    @staticmethod
    def is_valid_static(board: "dict[str,int|None]", move: str, player: int) -> bool:
        board_ = Board()
        board_.board = board

        return board_.is_valid(move, player)

    @staticmethod
    def is_in_board_static(board: "dict[str,int|None]", move: str) -> bool:
        board_ = Board()
        board_.board = board

        return board_.is_in_board(move)

    @staticmethod
    def _possible_moves_placement(board: "dict[str,int|None]") -> list[str]:
        """
        Get possible moves for the player
        """
        moves = []
        for key, value in board.items():
            if value is None:
                moves.append(key)
        return moves

    def is_valid(self, move: str, player: int) -> bool:
        return self.board[move] == None and self.board[move] != -1

    def is_in_board(self, move: str) -> bool:
        """
        Check if the move is valid
        """
        return move in self.board.keys() and self.board[move] != -1

    def is_in_board_xy(self, x: int, y: int) -> bool:
        """
        Check if the move is valid
        """
        move = f"{x},{y}"
        return move in self.board.keys() and self.board[move] != -1

    def _get_adjacent_points(self, point: str) -> list[str]:
        x = int(point.split(',')[0])
        y = int(point.split(',')[1])

        adjacent_points = []

        normal = [
            (0, 1), (0, -1),
            (1, 0), (-1, 0)
        ]
        diagonal = [
            (1, 1), (1, -1),
            (-1, 1), (-1, -1)
        ]

        all = normal

        # Check if the point is on the top/bottom edge of the board
        if (x == 1 and y == 1) or ((x == 0 and y == 0) or (x == 2 and y == 2) or (x == 0 and y == 2) or (x == 2 and y == 0)):
            all += diagonal

        for dx, dy in all:
            new_x = x + dx
            new_y = y + dy
            if self.is_in_board_xy(new_x, new_y):
                adjacent_points.append(f"{new_x},{new_y}")

        return adjacent_points

    @staticmethod
    def minimax_placement(board: "dict[str,int|None]", depth: int, maximizing_player: bool, player: int, opponent: int, alpha=float('-inf'), beta=float('inf')) -> int:
        """
        Minimax algorithm with alpha-beta pruning for placement phase
        """
        # Check if the game is over
        winner = Board.is_win(board)
        if winner == player:
            return 100 - depth  # Win (higher score for quicker wins)
        elif winner == opponent:
            return depth - 100  # Loss (higher penalty for quicker losses)
        elif winner == 0:  # Draw
            return 0

        if board.get('1,1') == opponent and sum([1 for p in board.values() if p is not None and p != -1]) == 2:
            if board.get('0,0') == player or board.get('2,2') == player or board.get('0,2') == player or board.get('2,0') == player:
                return 1000

        # Check if placement phase is complete
        pieces_on_board = sum(1 for v in board.values() if v is not None)
        if pieces_on_board >= 6:
            # If all pieces are placed, evaluate using movement phase logic
            return Board.minimax_mouvement(board, depth, maximizing_player, player, opponent, alpha, beta)

        # Depth cutoff
        if depth >= Board.DEPTH:  # Reduced depth, with better evaluation
            return Board.evaluate_position(board, player, opponent)

        if maximizing_player:
            best_score = float('-inf')
            for move in Board._possible_moves_placement(board):
                board_copy = board.copy()
                board_copy[move] = player

                score = Board.minimax_placement(
                    board_copy, depth + 1, False, player, opponent, alpha, beta)
                best_score = max(score, best_score)

                # Alpha-Beta Pruning
                alpha = max(alpha, best_score)
                if beta <= alpha:
                    break  # Prune remaining branches

            return int(best_score) if best_score != float('-inf') else 0
        else:
            best_score = float('inf')
            for move in Board._possible_moves_placement(board):
                board_copy = board.copy()
                board_copy[move] = opponent

                score = Board.minimax_placement(
                    board_copy, depth + 1, True, player, opponent, alpha, beta)
                best_score = min(score, best_score)

                # Alpha-Beta Pruning
                beta = min(beta, best_score)
                if beta <= alpha:
                    break  # Prune remaining branches

            return int(best_score) if best_score != float('inf') else 0

    @staticmethod
    def minimax_mouvement(board: "dict[str, int|None]", depth: int, maximizing_player: bool, player: int, opponent: int, alpha=float('-inf'), beta=float('inf')) -> int:
        """
        Minimax algorithm with alpha-beta pruning for movement phase
        """
        # Check if the game is over or depth limit reached
        winner = Board.is_win(board)
        if winner == player:
            return 100 - depth  # Win (higher score for quicker wins)
        elif winner == opponent:
            return depth - 100  # Loss (higher penalty for quicker losses)
        elif winner == 0:  # Draw
            return 0
        elif depth >= 6:  # Reasonable depth limit
            return Board.evaluate_position(board, player, opponent)

        if maximizing_player:
            best_score = float('-inf')
            for move1, move2 in Board._possible_moves_mouvement(board, player):
                # Make move
                board_copy = board.copy()
                board_copy[move1] = None
                board_copy[move2] = player

                # Recursive evaluation
                score = Board.minimax_mouvement(
                    board_copy, depth + 1, False, player, opponent, alpha, beta)
                best_score = max(score, best_score)

                # Alpha-Beta Pruning
                alpha = max(alpha, best_score)
                if beta <= alpha:
                    break  # Prune remaining branches

            return int(best_score) if best_score != float('-inf') else 0
        else:
            best_score = float('inf')
            for move1, move2 in Board._possible_moves_mouvement(board, opponent):
                # Make move
                board_copy = board.copy()
                board_copy[move1] = None
                board_copy[move2] = opponent

                # Recursive evaluation
                score = Board.minimax_mouvement(
                    board_copy, depth + 1, True, player, opponent, alpha, beta)
                best_score = min(score, best_score)

                # Alpha-Beta Pruning
                beta = min(beta, best_score)
                if beta <= alpha:
                    break  # Prune remaining branches

            return int(best_score) if best_score != float('inf') else 0

    @staticmethod
    def find_best_placement_move(board, current_player, time_limit=1.0):
        """
        Find the best placement move using iterative deepening
        """
        import time

        opponent = 2 if current_player == 1 else 1
        best_move = None

        # Start with depth 1 and increase
        for depth in range(1, 9):  # Maximum depth of 9 for placement
            start_time = time.time()

            best_score = float('-inf')
            current_best_move = None

            for move in Board._possible_moves_placement(board):
                board_copy = board.copy()
                board_copy[move] = current_player

                score = Board.minimax_placement(
                    board_copy, 0, False, current_player, opponent,
                    float('-inf'), float('inf'))

                if score > best_score:
                    best_score = score
                    current_best_move = move

            # Update our best move if we found one
            if current_best_move is not None:
                best_move = current_best_move

            # Check if we're running out of time
            elapsed = time.time() - start_time
            if elapsed > time_limit / 2:  # If this depth took too long, stop increasing
                break

        return best_move

    @staticmethod
    def find_best_movement_move(board: "dict[str, int|None]", current_player, time_limit=1.0):
        """
        Find the best movement move using iterative deepening
        """
        import time

        opponent = 2 if current_player == 1 else 1
        best_move = None

        # Start with depth 1 and increase
        for depth in range(1, 7):  # Maximum depth of 7 for movement
            start_time = time.time()

            best_score = float('-inf')
            current_best_move = None

            for move1, move2 in Board._possible_moves_mouvement(board, current_player):
                board_copy = board.copy()
                board_copy[move1] = None
                board_copy[move2] = current_player

                score = Board.minimax_mouvement(
                    board_copy, 0, False, current_player, opponent, float('-inf'), float('inf'))

                if score > best_score:
                    best_score = score
                    current_best_move = (move1, move2)

            # Update our best move if we found one
            if current_best_move is not None:
                best_move = current_best_move

            # Check if we're running out of time
            elapsed = time.time() - start_time
            if elapsed > time_limit / 2:  # If this depth took too long, stop increasing
                break

        return best_move

    def best_move(self, player: int) -> "tuple[tuple[str,str]|str|None, str]":
        """
        Get the best move for the player
        """

        result = Board.is_win(self.board)
        if result != -1:
            if result == 0:
                return None, "draw"
            elif result == player:
                return None, f"win player {player}"
            else:
                return None, f"lose player {player}"

        if len([v for v in self.board.values() if v is not None and v != -1]) < 6:
            return Board.find_best_placement_move(self.board, player), "placement"
        else:
            return Board.find_best_movement_move(self.board, player), "mouvement"

    @staticmethod
    def evaluate_position(board: "dict[str,int|None]", player: int, opponent: int) -> int:
        """
        Static evaluation function that assesses board positions
        without requiring full search to terminal states
        """
        # Check for immediate wins first
        winner = Board.is_win(board)
        if winner == player:
            return 1000  # Immediate win
        elif winner == opponent:
            return -1000  # Immediate loss

        score = 0

        # Evaluate near-wins for both players
        player_lines = Board.count_potential_lines(board, player)
        opponent_lines = Board.count_potential_lines(board, opponent)

        # Heavily weight two-in-a-row with an empty third position
        score += player_lines['two_in_line'] * 10
        score -= opponent_lines['two_in_line'] * \
            15  # Prioritize blocking opponent wins

        # Value center position
        center = '1,1'  # Assuming this is your center coordinate
        if board.get(center) == player:
            score += 5
        elif board.get(center) == opponent:
            score -= 5

        # Value corners
        corners = ['0,0', '0,2', '2,0', '2,2']
        for corner in corners:
            if board.get(corner) == player:
                score += 3
            elif board.get(corner) == opponent:
                score -= 3

        return score

    @staticmethod
    def count_potential_lines(board: "dict[str,int|None]", player: int) -> dict[Literal['two_in_line', 'one_in_line'], int]:
        """
        Count how many potential winning lines the player has
        """

        result: dict[Literal['two_in_line', 'one_in_line'], int] = {
            'two_in_line': 0,
            'one_in_line': 0
        }

        for line in Board.LINES_WINNING:
            player_count = sum(1 for pos in line if board.get(pos) == player)
            empty_count = sum(1 for pos in line if board.get(pos) is None)

            # Count lines with two pieces and one empty space
            if player_count == 2 and empty_count == 1:
                result['two_in_line'] += 1
            # Count lines with one piece and two empty spaces
            elif player_count == 1 and empty_count == 2:
                result['one_in_line'] += 1

        return result

    # Debugging function
    def print_board(self):
        """
        Print the board
        """
        for i in range(3):
            for j in range(3):
                print(
                    (self.board[f"{i},{j}"] if self.board[f"{i},{j}"] is not None else 0), end=" ")
            print()


# Testing
if __name__ == "__main__":
    board = Board()

    # Example board

    board.board = {
        '0,0': 1,
        '0,1': 2,
        '0,2': None,
        '1,0': 1,
        '1,1': None,
        '1,2': None,
        '2,0': None,
        '2,1': None,
        '2,2': None,
    }

    current_player = 2

    for i in range(10):
        board.print_board()
        result, type = board.best_move(current_player)
        if type == "placement":
            print(f"Best placement move: {result}")
            board.board[result] = current_player  # type: ignore
        elif type == "mouvement":
            print(f"Best movement move: {result}")
            board.board[result[0]] = None  # type: ignore
            board.board[result[1]] = current_player  # type: ignore
        else:
            print(type)
            break

        current_player = 1 if current_player == 2 else 2
        print()
    # except Exception as e:
    #     print(e.)
