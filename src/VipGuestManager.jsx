import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import "./VipGuestManager.css";

export default function VipGuestManager() {
  const [vipName, setVipName] = useState("");
  const [vipPhone, setVipPhone] = useState("");
  const [vipGuests, setVipGuests] = useState([]);
  const [vipSaving, setVipSaving] = useState(false);
  const [vipLoading, setVipLoading] = useState(true);
  const [vipMessage, setVipMessage] = useState("");
  const [vipError, setVipError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isVipListOpen, setIsVipListOpen] = useState(false);

  const filteredVipGuests = vipGuests.filter((guest) => {
  const search = searchTerm.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const guestName = String(guest.name || "").toLowerCase();
  const guestPhone = String(guest.phone || guest.id || "")
    .replace(/\D/g, "");

  const searchedPhone = search.replace(/\D/g, "");

  return (
    guestName.includes(search) ||
    (searchedPhone && guestPhone.includes(searchedPhone))
  );
});

  const normalizePhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");

    if (digits.length === 11 && digits.startsWith("1")) {
      return digits.slice(1);
    }

    return digits;
  };

  const loadVipGuests = async () => {
    try {
      setVipLoading(true);
      setVipError("");

      const snapshot = await getDocs(
        collection(db, "invitations")
      );

      const guests = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      guests.sort((firstGuest, secondGuest) =>
        String(firstGuest.name || "").localeCompare(
          String(secondGuest.name || "")
        )
      );

      setVipGuests(guests);
    } catch (error) {
      console.error("VIP guest loading error:", error);

      setVipError(
        error?.message || "Unable to load the VIP guest list."
      );
    } finally {
      setVipLoading(false);
    }
  };

  useEffect(() => {
    loadVipGuests();
  }, []);

  const handleAddVipGuest = async (event) => {
    event.preventDefault();

    const cleanName = vipName.trim();
    const normalizedPhone = normalizePhone(vipPhone);

    setVipMessage("");
    setVipError("");

    if (!cleanName) {
      setVipError("Please enter the guest name.");
      return;
    }

    if (normalizedPhone.length !== 10) {
      setVipError(
        "Please enter a valid 10-digit US phone number."
      );
      return;
    }

    try {
      setVipSaving(true);

      const invitationRef = doc(
        db,
        "invitations",
        normalizedPhone
      );

      await setDoc(
        invitationRef,
        {
          name: cleanName,
          phone: normalizedPhone,
          inviteType: "all",
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setVipName("");
      setVipPhone("");
      setVipMessage(
        `${cleanName} was added to the VIP guest list.`
      );

      await loadVipGuests();
    } catch (error) {
      console.error("VIP guest saving error:", error);

      setVipError(
        error?.message || "Unable to add the VIP guest."
      );
    } finally {
      setVipSaving(false);
    }
  };

  const handleDeleteVipGuest = async (guest) => {
    const guestName = guest.name || "this guest";

    const confirmed = window.confirm(
      `Remove ${guestName} from the VIP guest list?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setVipError("");
      setVipMessage("");

      await deleteDoc(
        doc(db, "invitations", guest.id)
      );

      setVipMessage(
        `${guestName} was removed from the VIP guest list.`
      );

      await loadVipGuests();
    } catch (error) {
      console.error("VIP guest deletion error:", error);

      setVipError(
        error?.message || "Unable to remove the VIP guest."
      );
    }
  };

  return (
    <section className="vip-management-section">
      <div className="vip-management-header">
        <div>
          <p className="admin-eyebrow">
            Invitation Management
          </p>

          <h2>Add VIP Guest</h2>

          <p>
            VIP guests will receive access to all wedding
            events.
          </p>
        </div>

        <strong>
          {vipGuests.length} VIP Guest
          {vipGuests.length === 1 ? "" : "s"}
        </strong>
      </div>

      <form
        className="vip-form"
        onSubmit={handleAddVipGuest}
      >
        <div className="vip-field">
          <label htmlFor="vipGuestName">
            Guest name
          </label>

          <input
            id="vipGuestName"
            type="text"
            value={vipName}
            onChange={(event) =>
              setVipName(event.target.value)
            }
            placeholder="Enter guest name"
            maxLength={100}
            required
          />
        </div>

        <div className="vip-field">
          <label htmlFor="vipGuestPhone">
            Phone number
          </label>

          <input
            id="vipGuestPhone"
            type="tel"
            value={vipPhone}
            onChange={(event) =>
              setVipPhone(event.target.value)
            }
            placeholder="2019783802"
            required
          />
        </div>

        <button
          type="submit"
          disabled={vipSaving}
        >
          {vipSaving ? "Saving..." : "Add VIP Guest"}
        </button>
      </form>

      {vipMessage && (
        <p className="vip-message">
          {vipMessage}
        </p>
      )}

      {vipError && (
        <p className="vip-error">
          {vipError}
        </p>
      )}

      <div className="vip-search-section">
  <label htmlFor="vipGuestSearch">
    Search VIP guest
  </label>

  <div className="vip-search-row">
    <input
      id="vipGuestSearch"
      type="search"
      value={searchTerm}
      onChange={(event) =>
        setSearchTerm(event.target.value)
      }
      placeholder="Search by name or phone number"
    />

    {searchTerm && (
      <button
        type="button"
        onClick={() => setSearchTerm("")}
      >
        Clear
      </button>
    )}
  </div>

  {searchTerm.trim() && (
    <p className="vip-search-result">
      {filteredVipGuests.length > 0
        ? `${filteredVipGuests.length} matching VIP guest${
            filteredVipGuests.length === 1 ? "" : "s"
          } found`
        : "This guest is not in the VIP list."}
    </p>
  )}
</div>

      <div className="vip-accordion">
  <button
    type="button"
    className="vip-accordion-header"
    onClick={() => setIsVipListOpen((current) => !current)}
    aria-expanded={isVipListOpen}
  >
    <span>
      View VIP Guest List
      <small>
        {vipGuests.length} guest
        {vipGuests.length === 1 ? "" : "s"}
      </small>
    </span>

    <span
      className={`vip-accordion-icon ${
        isVipListOpen ? "open" : ""
      }`}
    >
      ▼
    </span>
  </button>

  {isVipListOpen && (
    <div className="vip-accordion-content">
      <div className="vip-search-section">
        <label htmlFor="vipGuestSearch">
          Search VIP guest
        </label>

        <div className="vip-search-row">
          <input
            id="vipGuestSearch"
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by name or phone number"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          )}
        </div>

        {searchTerm.trim() && (
          <p className="vip-search-result">
            {filteredVipGuests.length > 0
              ? `${filteredVipGuests.length} matching VIP guest${
                  filteredVipGuests.length === 1 ? "" : "s"
                } found`
              : "This guest is not in the VIP list."}
          </p>
        )}
      </div>

      <div className="vip-list-wrapper">
        {vipLoading ? (
          <p className="vip-loading">
            Loading VIP guests...
          </p>
        ) : (
          <table className="vip-list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Invitation</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredVipGuests.map((guest) => (
                <tr key={guest.id}>
                  <td>
                    <strong>
                      {guest.name || "Guest"}
                    </strong>
                  </td>

                  <td>{guest.phone || guest.id}</td>

                  <td>All Events</td>

                  <td>
                    <button
                      type="button"
                      className="vip-delete-button"
                      onClick={() =>
                        handleDeleteVipGuest(guest)
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {filteredVipGuests.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="vip-empty"
                  >
                    {searchTerm.trim()
                      ? "No matching VIP guest found."
                      : "No VIP guests have been added."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )}
</div>
    </section>
  );
}