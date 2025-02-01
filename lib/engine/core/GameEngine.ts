import {Board} from './Board';
import {RuleSet} from './RuleSet';
import {Move, PieceType, PlayerColor, Position} from "@/lib/engine/type";
import {MovementStrategy} from "@/lib/engine/movement/strategies";

interface Engine {
    board: Board;
    ruleSet: RuleSet;

    getLegalMoves(position: Position): Move[]

    move(move: Move): void

    // api for override pieces movement rule
    overrideMovementRule(pieceType: PieceType, strategy: MovementStrategy): void


    // api for override turns
    remainingMoves(): number;
    setMoveLimit(limit: number): void;
    resetMoveLimit(): void;
}

export class ChessEngine implements Engine {
    // TODO: implement ChessEngine

}