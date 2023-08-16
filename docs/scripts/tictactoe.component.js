const {register, template, repeat, html, useValue, when} = window.BFS?.Cube;

const TicTacToe = (props) => {
  const [currentPlayer, setCurrentPlayer] = useValue(props.startingPlayer());
  const [finished, setFinished] = useValue(false);
  let winCells = [];
  let cellsData = Array.from({length: 9}, (_, i) => ({label: ''}));
  
  const isGameFinished = (player) => {
    winCells = [
      // horizontals
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // verticals
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // diagonals
      [0, 4, 8],
      [2, 4, 6],
    ].find(trip => {
      return trip.every((idx) => cellsData[idx].label === player)
    }) ?? []
    
    return winCells.length == 3
      || cellsData.every(cell => Boolean(cell.label));
  }
  
  const reset = () => {
    winCells = [];
    cellsData = Array.from(
      {length: 9},
      (_, i) => ({label: ''})
    );
    setFinished(false);
  }
  
  const onPlay = (index) => {
    if(!finished() && !cellsData[index].label) {
      const label = currentPlayer();
      cellsData[index] = {label};
      
      if(isGameFinished(label)) {
        setFinished(true);
      } else {
        setCurrentPlayer(label === 'x' ? 'y' : 'x');
      }
    }
  }
  
  const cells = repeat(
    () => cellsData,
    (val, index) => html`
        <div class="cell"
          attr.class.win-cell="${() => winCells?.includes(index)}"
          onclick="${() => onPlay(index)}">
          ${val.label}
        </div>`
  )
  
  template`
    <h2>Tic Tac Toe</h2>
    <div class="board">${cells}</div>
    ${when(finished,
      html`
        ${when(() => winCells.length,
          html`<p>Player "${currentPlayer}" won! Congratulations!</p>`,
          html`<p>It's a tie! No winners this time</p>`,
        )}
        <button type="button" onclick="${reset}">Start New Round!</button>
      `,
      html`<p>Player "${currentPlayer}" turn!</p>`)}
  `;
}

const TicTacToeStyle = () => {
  return {
    ":host": {
      display: "block",
      padding: 10,
      fontFamily: "sans-serif",
      '*': {
        boxSizing: 'border-box',
      },
      color: "#222",
      h2: {
        margin: "0 0 20px"
      },
      '.board': {
        width: 200,
        display: 'grid',
        border: "1px solid #222",
        gridTemplateRows: 'repeat(3, 60px)',
        gridTemplateColumns: 'repeat(3, 1fr)',
        '.cell': {
          border: "1px solid #222",
          cursor: 'pointer',
          textTransform: 'uppercase',
          fontSize: "2rem",
          display: 'flex',
          justifyContent: "center",
          alignItems: 'center',
          '&.win-cell': {
            color: "white",
            background: "green"
          }
        }
      },
      button: {
        all: "unset",
        cursor: 'pointer',
        color: "white",
        background: "#222",
        padding: "8px 14px",
        borderRadius: 3
      }
    }
  };
}

register(TicTacToe, {
  startingPlayer: "x"
}, TicTacToeStyle)
