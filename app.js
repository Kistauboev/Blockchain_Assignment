let userScore = 0;
let computerScore = 0;

// DOM elements
const userScore_span = document.getElementById("user-score");
const computerScore_span = document.getElementById("computer-score");
const result_p = document.querySelector(".result > p");
const rock_div = document.getElementById("r");
const paper_div = document.getElementById("p");
const scissors_div = document.getElementById("s");
const connectBtn = document.getElementById("connectBtn");

console.log("connectBtn =", connectBtn);

// Your Contract Data
const contractAddress = "0x34CD44C2dCDa202b0C3a77e943C54Ad895eDbff4";

const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "playerMove",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "computerMove",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "result",
        type: "int256",
      },
    ],
    name: "GameResult",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint8", name: "playerMove", type: "uint8" }],
    name: "play",
    outputs: [
      { internalType: "uint8", name: "computerMove", type: "uint8" },
      { internalType: "int256", name: "result", type: "int256" },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

let provider;
let signer;
let contract;

// Connect Wallet
connectBtn.onclick = async () => {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    connectBtn.innerText = "Wallet Connected";
  } else {
    alert("MetaMask not found!");
  }
};

// Move converter
function convert(num) {
  return ["Rock", "Paper", "Scissors"][num];
}

// Send move to blockchain
async function playOnChain(move) {
  result_p.innerHTML = "Waiting for blockchain...";

  const tx = await contract.play(move, {
    value: 100000000000000n,
  });

  await tx.wait(); // wait for confirmation

  // read event from receipt
  const receipt = await provider.getTransactionReceipt(tx.hash);
  const log = receipt.logs[0];
  const parsed = contract.interface.parseLog(log);

  const computerMove = parsed.args.computerMove;
  const result = parsed.args.result;

  return { computerMove, result };
}

// Frontend click events
async function game(move) {
  try {
    const { computerMove, result } = await playOnChain(move);

    if (result == 1) {
      userScore++;
      result_p.innerHTML = `${convert(move)} beats ${convert(
        computerMove
      )} — YOU WIN 🎉`;
    } else if (result == -1) {
      computerScore++;
      result_p.innerHTML = `${convert(move)} loses to ${convert(
        computerMove
      )} — YOU LOSE 😢`;
    } else {
      result_p.innerHTML = `${convert(move)} equals ${convert(
        computerMove
      )} — DRAW 🤝`;
    }

    userScore_span.innerHTML = userScore;
    computerScore_span.innerHTML = computerScore;
  } catch (err) {
    console.log(err);
    result_p.innerHTML = "Transaction Rejected ❌";
  }
}

// Button listeners
rock_div.onclick = () => game(0);
paper_div.onclick = () => game(1);
scissors_div.onclick = () => game(2);
