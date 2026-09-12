from flask import Blueprint, request

from app.functions import Board

main_bp = Blueprint('main', __name__)


@main_bp.route('/next_move', methods=['POST'])
def next_move():
    if request.json is None:
        return {"error": "Invalid JSON body"}, 400

    board = request.json.get('board')
    player = request.json.get('playerId')
    state = request.json.get('state')

    if board is None or player is None or state is None:
        return {"error": "Missing required fields"}, 400

    board_element = Board()
    board_element.board = board
    board_element.state = state

    [best_move, state] = board_element.best_move(player)

    if best_move is None:
        return {"error": "No valid move found"}, 200

    if isinstance(best_move, str):
        return {"best_move": best_move, "state": state}, 200

    return {"from": best_move[0], "to": best_move[1], "state": state}, 200
