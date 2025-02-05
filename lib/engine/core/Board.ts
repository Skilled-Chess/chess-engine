import { Piece, Move, BoardState, Position, PlayerColor } from '@/lib/engine/type';


export interface Board {

    state: BoardState;

    // create init board and return the init state of the board
    createInitialBoard(): BoardState

    // deep copy the state for the engine
    getBoardState(): BoardState

    // move the piece with validation
    move(move: Move): boolean

    // get current player turn
    getCurrentTurn(): PlayerColor

    // get current grid
    getGrid(): Piece[][];

    // get move history
    getHistory(): Move[]

    switchTurn(): void
    getCaptured(): Piece[]
    getPiece(position: Position): Piece
}


export class ClassicBoard implements Board {
    state: BoardState;

    constructor() {
        // initialize the board state when constructed
        this.state = this.createInitialBoard();
    }

    /**
     * Creates a new BoardState with the standard chess initial setup.
     */
    createInitialBoard(): BoardState {
        const grid: Piece[][] = Array(8)
            .fill({})
            .map(() => Array(8).fill({}));

        // Helper: given row & column indices, convert to chess position.
        const indicesToPosition = (row: number, col: number): Position => {
            return { x: String.fromCharCode('a'.charCodeAt(0) + col), y: 8 - row };
        };

        // Place black pieces on rows 0 and 1.
        grid[0][0] = { type: 'rook', color: 'black', hasMoved: false };
        grid[0][1] = { type: 'knight', color: 'black', hasMoved: false };
        grid[0][2] = { type: 'bishop', color: 'black', hasMoved: false };
        grid[0][3] = { type: 'queen', color: 'black', hasMoved: false };
        grid[0][4] = { type: 'king', color: 'black', hasMoved: false };
        grid[0][5] = { type: 'bishop', color: 'black', hasMoved: false };
        grid[0][6] = { type: 'knight', color: 'black', hasMoved: false };
        grid[0][7] = { type: 'rook', color: 'black', hasMoved: false };
        for (let col = 0; col < 8; col++) {
            grid[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
        }

        // Place white pieces on rows 6 and 7.
        for (let col = 0; col < 8; col++) {
            grid[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        grid[7][0] = { type: 'rook', color: 'white', hasMoved: false };
        grid[7][1] = { type: 'knight', color: 'white', hasMoved: false };
        grid[7][2] = { type: 'bishop', color: 'white', hasMoved: false };
        grid[7][3] = { type: 'queen', color: 'white', hasMoved: false };
        grid[7][4] = { type: 'king', color: 'white', hasMoved: false };
        grid[7][5] = { type: 'bishop', color: 'white', hasMoved: false };
        grid[7][6] = { type: 'knight', color: 'white', hasMoved: false };
        grid[7][7] = { type: 'rook', color: 'white', hasMoved: false };

        return {
            grid,
            turn: 'white',
            moveHistory: [],
            capturedPieces: [],
        };
    }

    /**
     * Returns a deep copy of the board state.
     */
    getBoardState(): BoardState {
        // Shallow copy the grid rows (pieces are objects but assumed immutable in move generation).
        const gridCopy = this.state.grid.map(row => row.slice());
        return {
            grid: gridCopy,
            turn: this.state.turn,
            moveHistory: [...this.state.moveHistory],
            capturedPieces: [...this.state.capturedPieces],
        };
    }

    /**
     * Moves a piece according to the move object.
     * (This method assumes the move has already been validated by the engine/rules.)
     */
    move(move: Move): boolean {
        // Convert positions to grid indices.
        const posToIndices = (position: Position): { row: number; col: number } => {
            const col = position.x.charCodeAt(0) - 'a'.charCodeAt(0);
            const row = 8 - position.y;
            return { row, col };
        };

        const fromIndices = posToIndices(move.from);
        const toIndices = posToIndices(move.to);
        const piece = this.state.grid[fromIndices.row][fromIndices.col];
        if (!piece) {
            return false; // no piece to move
        }

        // Capture logic: if there's a piece at the target square, add it to capturedPieces.
        const targetPiece = this.state.grid[toIndices.row][toIndices.col];
        if (targetPiece) {
            this.state.capturedPieces.push(targetPiece);
        }

        // Move the piece.
        this.state.grid[toIndices.row][toIndices.col] = { ...piece, hasMoved: true };
        this.state.grid[fromIndices.row][fromIndices.col] = {};

        // Append move to history.
        this.state.moveHistory.push(move);

        // Switch turn.
        this.switchTurn();
        return true;
    }

    /**
     * Returns the color of the current turn.
     */
    getCurrentTurn(): PlayerColor {
        return this.state.turn;
    }

    /**
     * Returns the entire grid.
     */
    getGrid(): Piece[][] {
        return this.state.grid;
    }

    /**
     * Returns a copy of the move history.
     */
    getHistory(): Move[] {
        return [...this.state.moveHistory];
    }

    /**
     * Switches the current turn.
     */
    switchTurn(): void {
        this.state.turn = this.state.turn === 'white' ? 'black' : 'white';
    }

    /**
     * Returns a copy of the captured pieces.
     */
    getCaptured(): Piece[] {
        return [...this.state.capturedPieces];
    }

    /**
     * Returns the piece at the given board position.
     */
    getPiece(position: Position): Piece {
        const col = position.x.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - position.y;
        return this.state.grid[row][col];
    }
}

