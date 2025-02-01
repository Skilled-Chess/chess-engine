import {Move, Piece, Position} from "@/lib/engine/type";
import {Board} from "@/lib/engine/core/Board";

export interface MovementStrategy {
    getPossibleMoves(
        piece: Piece,
        position: Position,
        board: Board
    ): Move[];
}


class PawnStrategy implements MovementStrategy {
    // TODO: implement classic pawn movement
}

class SuperPawnStrategy extends PawnStrategy {
    // TODO: implement skilled pawn movement (like 3 forward moves...)
}