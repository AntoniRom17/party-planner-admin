// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2602-FTB-CT-WEB-PT";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

// === API Calls ===
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button id="delete-btn">Delete Party</button>
  `;

  $party.querySelector("GuestList").replaceWith(GuestList());

  $party.querySelector("#delete-btn").addEventListener("click", async () => {
    try {
      await fetch(API + "/events/" + selectedParty.id, {
        method: "DELETE",
      });

      selectedParty = null;
      await getParties();
      render();
    } catch (err) {
      console.error(err);
    }
  });

  return $party;
}

function PartyForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <h2>Add New Party</h2>
    <label>
      Name:
      <input name="name" required />
    </label>
    <label>
      Description:
      <textarea name="description" required></textarea>
    </label>
    <label>
      Date:
      <input type="date" name="date" required />
    </label>
    <label>
      Location:
      <input name="location" required />
    </label>
    <button type="submit">Create Party</button>
  `;

  $form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData($form);
    const name = formData.get("name");
    const description = formData.get("description");
    const date = formData.get("date");
    const location = formData.get("location");

    const isoDate = new Date(date).toISOString();

    try {
      await fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          date: isoDate,
          location,
        }),
      });

      await getParties();
      selectedParty = null;
      render();
    } catch (err) {
      console.error(err);
    }
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section id="form-section">
        <PartyForm></PartyForm>
      </section>

      <section class="parties-box">
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>

      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyForm").replaceWith(PartyForm());
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

// === Init ===
async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();