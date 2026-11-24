import "../facilities/facilities.css";

// Placeholder for Büşra's Library module.
// Her code (root /client + /server in the repo) is still a separate app: React 19, its own server on port 3001.
// To mount it here, move her UI into this folder and point it at her server (see the note in README).
export default function LibraryPage() {
  return (
    <div>
      <h2 className="page-title">Library</h2>
      <section className="card">
        <p>The library module (seat reservation with QR check-in) is built by Büşra and still runs as its own app.</p>
        <p className="hint">
          Start it from the repo's root <code>client</code> and <code>server</code> folders for now. The dashboard already reads its reservations
          from port 3001.
        </p>
      </section>
    </div>
  );
}
