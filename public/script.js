const socket = io();

let peerConnection = new RTCPeerConnection();
let localStream;
let remoteStream;

let statusElement = document.getElementById("status");

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
    },
  });
  remoteStream = new MediaStream();
  document.getElementById("user-1").srcObject = localStream;
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getAudioTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    // statusElement.innerText = "Connected";
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
};

let createOffer = async () => {
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      const offerSDP = peerConnection.localDescription;
      socket.emit("offer", offerSDP);
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
};

let createAnswer = async (offer) => {
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("Adding answer candidate...:", event.candidate);
      const answerSDP = peerConnection.localDescription;
      socket.emit("answer", answerSDP);
    }
  };

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
};

let addAnswer = async (answer) => {
  console.log("answer:", answer);
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

init();

const offerButton = document.getElementById("offerButton");
let isAdmin = false;

let platform = navigator.userAgentData.platform;

if (platform == "macOS") {
  const user2 = document.getElementById("user-2");
  user2.muted = false;
  user2.volume = 1.0;
}

offerButton.addEventListener("click", () => {
  createOffer();
});

socket.on("phone", () => {
  statusElement.innerText = "Phone Connected";
});

socket.on("offer", async (offer) => {
  createAnswer(offer);
});

socket.on("answer", async (answer) => {
  await addAnswer(answer);
});
