import axios from "axios";
import { useEffect, useState, useCallback, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BASE_URL } from "./config";

/* =========================
   Role Options
========================= */

const ROLE_OPTIONS = [
  { label: "Hirer", value: "hirer" },
  { label: "Employee", value: "employee" },
  { label: "Guest", value: "guest" },
];

const FILTER_ROLE_OPTIONS = [
  { label: "All Roles", value: "" },
  ...ROLE_OPTIONS,
];

/* =========================
   Component
========================= */

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     Fetch Users
  ========================= */

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${BASE_URL}/api/auth/admin/users`,
        {
          withCredentials: true,
          params: { search, role },
        }
      );

      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* =========================
     Actions
  ========================= */

  const toggleDisable = async (id) => {
    await axios.patch(
      `${BASE_URL}/api/auth/admin/users/${id}/toggle-disable`,
      {},
      { withCredentials: true }
    );
    fetchUsers();
  };

  const changeRole = async (id, role) => {
    await axios.patch(
      `${BASE_URL}/api/auth/admin/users/${id}/role`,
      { role },
      { withCredentials: true }
    );
    fetchUsers();
  };

  const selectedFilterRole =
    FILTER_ROLE_OPTIONS.find((r) => r.value === role) ||
    FILTER_ROLE_OPTIONS[0];

  /* =========================
     Render
  ========================= */

  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">👥 Manage Users</h1>

      {/* ================= Filters ================= */}
      <div className="flex gap-4 mb-6 items-center">
        <input
          className="px-4 py-2 rounded bg-white/10"
          placeholder="Search email or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Role Filter */}
        <Listbox
          value={selectedFilterRole}
          onChange={(selected) => setRole(selected.value)}
        >
          <div className="relative w-48">
            <Listbox.Button className="w-full px-4 py-2 rounded bg-white/10 text-left">
              {selectedFilterRole.label}
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2 w-full rounded-xl bg-gray-900 border border-white/10 shadow-lg">
                {FILTER_ROLE_OPTIONS.map((r) => (
                  <Listbox.Option
                    key={r.value}
                    value={r}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 ${
                        active ? "bg-white/10" : ""
                      }`
                    }
                  >
                    {r.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* ================= Status ================= */}
      {loading && <p className="text-gray-400">Loading users…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {/* ================= Users ================= */}
      <div className="space-y-3">
        {!loading &&
          users.map((u) => {
            const selectedUserRole =
              ROLE_OPTIONS.find((r) => r.value === u.role) ||
              ROLE_OPTIONS[0];

            return (
              <div
                key={u._id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {u.email}
                    {u.isDisabled && (
                      <span className="ml-2 text-red-400">
                        (Disabled)
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-gray-400">
                    {u.role} ·{" "}
                    {u.isGuest ? "Guest" : "Registered"} ·{" "}
                    {u.isVerified ? "Verified" : "Unverified"}
                  </p>

                  {u.profession && (
                    <p className="text-xs text-gray-500">
                      {u.profession} ({u.professionType})
                    </p>
                  )}
                </div>

                {/* ================= Actions ================= */}
                <div className="flex gap-2 items-center">
                  <button
                    className="px-3 py-1 rounded bg-yellow-600"
                    onClick={() => toggleDisable(u._id)}
                  >
                    {u.isDisabled ? "Enable" : "Disable"}
                  </button>

                  {/* User Role Listbox */}
                  <Listbox
                    value={selectedUserRole}
                    onChange={(selected) =>
                      changeRole(u._id, selected.value)
                    }
                  >
                    <div className="relative w-32">
                      <Listbox.Button className="w-full px-2 py-1 rounded bg-white/10 text-left text-sm">
                        {selectedUserRole.label}
                      </Listbox.Button>

                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-20 mt-1 w-full rounded-lg bg-gray-900 border border-white/10 shadow-lg">
                          {ROLE_OPTIONS.map((r) => (
                            <Listbox.Option
                              key={r.value}
                              value={r}
                              className={({ active }) =>
                                `cursor-pointer px-3 py-1 text-sm ${
                                  active ? "bg-white/10" : ""
                                }`
                              }
                            >
                              {r.label}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default AdminUsers;
