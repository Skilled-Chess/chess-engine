import { Board } from './Board';
import { ClassicBoard } from './Board';
import { RuleSet, StandardRuleSet } from './RuleSet';
import { Move, PieceType, Position, PlayerColor } from '@/lib/engine/type';
import { MovementStrategy } from '@/lib/engine/movement/strategies';

export interface Engine {
    board: Board;
    ruleSet: RuleSet;

    getLegalMoves(position: Position): Move[];
    move(move: Move): void;
    overrideMovementRule(pieceType: PieceType, strategy: MovementStrategy): void;
    remainingMoves(): number;
    setMoveLimit(limit: number): void;
    resetMoveLimit(): void;
}

export class ChessEngine implements Engine {
    board: Board;
    ruleSet: RuleSet;

    // moveLimit is the number of moves a player can make in a turn.
    private moveLimitValue: number = 1;
    // movesLeft counts the remaining moves in the current turn.
    private movesLeft: number = 1;

    constructor() {
        this.board = new ClassicBoard();
        this.ruleSet = new StandardRuleSet();
    }

    /**
     * Returns the legal moves from a given board position.
     * This combines the normal moves from the piece’s movement strategy
     * with any special moves (e.g. castling) from the rule set.
     */
    getLegalMoves(position: Position): Move[] {
        const piece = this.board.getPiece(position);
        if (!piece || !piece.type) return [];
        // Get basic moves from the movement strategy.
        const strategy = this.ruleSet.getMovementStrategy(piece.type);
        const moves = strategy.getPossibleMoves(piece, position, this.board);
        // Add any special moves from the rule set.
        const special = this.ruleSet.getSpecialMoves(this.board, position);
        return [...moves, ...special];
    }

    /**
     * Executes a move. If the move is legal then:
     * - The board is updated.
     * - The multi–move logic is applied: if the move limit is greater than 1 and
     *   the player has remaining moves then we “revert” the turn switch.
     */
    move(move: Move): void {
        // Save the current player before the move.
        const currentPlayer: PlayerColor = this.board.getCurrentTurn();
        // Try to move on the board.
        const moved = this.board.move(move);
        if (!moved) return; // invalid move, do nothing

        // If multi–move is enabled (moveLimitValue > 1) then override the board's turn switch.
        if (this.moveLimitValue > 1) {
            if (this.movesLeft > 1) {
                // Revert the board's automatic turn switch so the same player continues.
                (this.board as any).state.turn = currentPlayer;
                this.movesLeft--;
            } else {
                // Last move of the turn – reset the moves left.
                this.movesLeft = this.moveLimitValue;
            }
        }
    }

    /**
     * Allows overriding the movement strategy for a given piece type.
     */
    overrideMovementRule(pieceType: PieceType, strategy: MovementStrategy): void {
        this.ruleSet.overrideStrategy(pieceType, strategy);
    }

    /**
     * Returns the number of moves remaining in the current turn.
     */
    remainingMoves(): number {
        return this.movesLeft;
    }

    /**
     * Sets the move limit (i.e. the number of moves allowed per turn).
     * This resets the moves left to the new limit.
     */
    setMoveLimit(limit: number): void {
        this.moveLimitValue = limit;
        this.movesLeft = limit;
    }

    /**
     * Resets the move limit back to the standard single move per turn.
     */
    resetMoveLimit(): void {
        this.moveLimitValue = 1;
        this.movesLeft = 1;
    }

    /**
     * A getter to expose the current player.
     */
    get currentPlayer(): PlayerColor {
        return this.board.getCurrentTurn();
    }
}
