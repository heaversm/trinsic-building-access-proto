async function issueAccess() {
  const accessCard = {
    name: document.getElementById("name").value,
    title: document.getElementById("title").value,
    team: document.getElementById("team").value,
    access: document.getElementById("access").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    id: document.getElementById("id").value,
  };

  openModal("Scan this code to accept a connectionless credential:");
  hideQRCode();
  showSpinner();
  axios.post("/api/issue", accessCard).then(async (response) => {
    setQRCodeImage(response.data.offerUrl);
    hideSpinner();
    showQRCode();
  });
}

async function verifyAccess() {
  hideAccepted();
  openModal("Scan this code to verify the access credential:");
  hideQRCode();
  showSpinner();
  let response = await axios.post("/api/verify");
  let verificationId = response.data.verificationId;
  setQRCodeImage(response.data.verificationRequestUrl);
  hideSpinner();
  showQRCode();

  let verification = { state: "Requested" };
  let timedOut = false;
  setTimeout(() => (timedOut = true), 1000 * 60);
  while (!timedOut && verification.state === "Requested") {
    let checkResponse = await axios.get("/api/checkVerification", {
      params: { verificationId: verificationId },
    });
    verification = checkResponse.data.verification;
  }

  hideQRCode();
  closeModal();
  console.log(
    "verification proof",
    verification.proof["Building Access Verification"].attributes["ID"]
  );
  if (verification.state === "Accepted") {
    showAccepted();
    setAcceptedData(
      verification.proof["Building Access Verification"].attributes["Name"],
      verification.proof["Building Access Verification"].attributes["ID"]
    );
  }
}

function openModal(text) {
  modal.style.display = "block";
  modalText.innerText = text;
}

function closeModal() {
  modal.style.display = "none";
}

function hideQRCode() {
  qr.style.display = "none";
}

function showQRCode() {
  qr.style.display = "block";
}

function setQRCodeImage(url) {
  qr.src =
    "https://chart.googleapis.com/chart?cht=qr&chl=" +
    url +
    "&chs=300x300&chld=L|1";
}

function hideSpinner() {
  spinner.style.display = "none";
}

function showSpinner() {
  spinner.style.display = "block";
}

function hideAccepted() {
  accepted.style.display = "none";
}

function showAccepted() {
  accepted.style.display = "block";
}

function setAcceptedData(name, accessID) {
  acceptedName.value = name;
  acceptedNumber.value = accessID;
}

function createUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
