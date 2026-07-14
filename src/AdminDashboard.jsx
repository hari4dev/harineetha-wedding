import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import "./AdminDashboard.css";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, db } from "./firebase";


const EVENTS = [
  {
    id: "prelude",
    name: "Sangeet Night",
    date: "August 28, 2026",
    venue: "Biriyani City, Hillsborough",
  },
  {
    id: "haldi",
    name: "Haldi & Engagement",
    date: "August 29, 2026",
    venue: "Serene Spring Farms, Hillsborough",
  },
  {
    id: "wedding",
    name: "Wedding Ceremony",
    date: "August 30, 2026",
    venue: "Royal Albert Palace, Fords",
  },
];

function createEmptyCount() {
  return {
    adults: 0,
    kids: 0,
    total: 0,
    responses: 0,
  };
}



export default function AdminDashboard() {
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [authenticated, setAuthenticated] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadResponses = async () => {
    try {
      setLoading(true);
      setError("");

      let snapshot;

      try {
        const rsvpQuery = query(
          collection(db, "rsvps"),
          orderBy("updatedAt", "desc")
        );

        snapshot = await getDocs(rsvpQuery);
      } catch (orderError) {
        console.warn(
          "Could not order by updatedAt. Loading without ordering.",
          orderError
        );

        snapshot = await getDocs(collection(db, "rsvps"));
      }

      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      console.log("Loaded RSVP documents:", data);

      setResponses(data);
    } catch (loadError) {
      console.error("Admin RSVP loading error:", loadError);

      setError(
        loadError?.message ||
          "Unable to load RSVP responses from Firestore."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadResponses();
    }
  }, [authenticated]);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setAuthenticated(Boolean(user));
    setCheckingAuth(false);
  });

  return unsubscribe;
}, []);

  const eventCounts = useMemo(() => {
    const counts = {};

    EVENTS.forEach((event) => {
      counts[event.id] = createEmptyCount();
    });

    responses.forEach((guest) => {
      EVENTS.forEach((event) => {
        const nestedResponse = guest.rsvps?.[event.id];

        /*
          Primary structure:

          rsvps: {
            prelude: {
              attending: true,
              adults: 1,
              kids: 0
            }
          }

          The fallback fields support your duplicate top-level fields:
          preludeAttending, preludeAdults, preludeKids, etc.
        */

        const attending =
          nestedResponse?.attending === true ||
          guest[`${event.id}Attending`] === true;

        if (!attending) {
          return;
        }

        const adults = Number(
          nestedResponse?.adults ??
            guest[`${event.id}Adults`] ??
            0
        );

        const kids = Number(
          nestedResponse?.kids ??
            guest[`${event.id}Kids`] ??
            0
        );

        counts[event.id].adults += adults;
        counts[event.id].kids += kids;
        counts[event.id].total += adults + kids;
        counts[event.id].responses += 1;
      });
    });

    return counts;
  }, [responses]);


  const handleLogin = async (event) => {
  event.preventDefault();

  try {
    setError("");

    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    setEmail("");
    setPassword("");
  } catch (loginError) {
    console.error("Admin login error:", loginError);
    setError("Incorrect email or password.");
  }
};

  const handleLogout = async () => {
  try {
    await signOut(auth);
    setResponses([]);
  } catch (logoutError) {
    console.error("Admin logout error:", logoutError);
  }
};

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Not available";
    }

    try {
      const date =
        typeof timestamp.toDate === "function"
          ? timestamp.toDate()
          : new Date(timestamp);

      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Not available";
    }
  };

  const getEventResponse = (guest, eventId) => {
    const nestedResponse = guest.rsvps?.[eventId];

    const attending =
      nestedResponse?.attending === true ||
      guest[`${eventId}Attending`] === true;

    const adults = Number(
      nestedResponse?.adults ??
        guest[`${eventId}Adults`] ??
        0
    );

    const kids = Number(
      nestedResponse?.kids ??
        guest[`${eventId}Kids`] ??
        0
    );

    return {
      attending,
      adults,
      kids,
      total: adults + kids,
    };
  };

  if (checkingAuth) {
  return (
    <main className="admin-login-page">
      <p>Checking admin access...</p>
    </main>
  );
}

  if (!authenticated) {
    return (
      <main className="admin-login-page">
        <form
  className="admin-login-card"
  onSubmit={handleLogin}
>
  <p className="admin-eyebrow">
    Hari & Neetha
  </p>

  <h1>Wedding Admin</h1>

  <p>Sign in to view RSVP responses</p>

  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Admin Email"
    autoComplete="email"
    required
  />

  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Password"
    autoComplete="current-password"
    required
  />

  <button type="submit">
    Sign In
  </button>
</form>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">
            Hari & Neetha
          </p>

          <h1>RSVP Dashboard</h1>

          <p>
            {responses.length} RSVP submission
            {responses.length === 1 ? "" : "s"} received
          </p>
        </div>

        <div className="admin-actions">
          <button
            type="button"
            onClick={loadResponses}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {loading && responses.length === 0 && (
        <p className="admin-message">
          Loading RSVP responses...
        </p>
      )}

      {error && (
        <div className="admin-error">
          <strong>Unable to load responses</strong>
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <>
          <section className="admin-summary-grid">
            {EVENTS.map((event) => {
              const count = eventCounts[event.id];

              return (
                <article
                  className="admin-event-card"
                  key={event.id}
                >
                  <p className="admin-event-date">
                    {event.date}
                  </p>

                  <h2>{event.name}</h2>

                  <p className="admin-event-venue">
                    {event.venue}
                  </p>

                  <div className="admin-count-row">
                    <div>
                      <strong>{count.adults}</strong>
                      <span>Adults</span>
                    </div>

                    <div>
                      <strong>{count.kids}</strong>
                      <span>Kids</span>
                    </div>

                    <div>
                      <strong>{count.total}</strong>
                      <span>Total</span>
                    </div>

                    <div>
                      <strong>{count.responses}</strong>
                      <span>Families</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="admin-table-section">
            <div className="admin-table-heading">
              <div>
                <h2>Guest Responses</h2>
                <p>
                  Event-wise RSVP information
                </p>
              </div>

              <span>
                {responses.length} submissions
              </span>
            </div>

            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Invite</th>

                    {EVENTS.map((event) => (
                      <th key={event.id}>
                        {event.name}
                      </th>
                    ))}

                    <th>Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {responses.map((guest) => (
                    <tr key={guest.id}>
                      <td>
                        <strong>
                          {guest.name || "Guest"}
                        </strong>
                      </td>

                      <td>{guest.phone || "—"}</td>

                      <td>{guest.email || "—"}</td>

                      <td>
                        {guest.inviteType === "all"
                          ? "All Events"
                          : "Wedding Only"}
                      </td>

                      {EVENTS.map((event) => {
                        const response =
                          getEventResponse(
                            guest,
                            event.id
                          );

                        return (
                          <td key={event.id}>
                            {response.attending ? (
                              <span className="attending">
                                Yes — {response.adults} adult
                                {response.adults === 1
                                  ? ""
                                  : "s"}
                                , {response.kids} kid
                                {response.kids === 1
                                  ? ""
                                  : "s"}
                              </span>
                            ) : (
                              <span className="not-attending">
                                Not attending
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td>
                        {formatDate(guest.updatedAt)}
                      </td>
                    </tr>
                  ))}

                  {!loading &&
                    responses.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="admin-empty"
                        >
                          No RSVP responses found.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}