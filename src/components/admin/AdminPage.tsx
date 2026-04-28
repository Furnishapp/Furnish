"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Loader2,
  Users,
  FolderOpen,
  Package,
  ChevronDown,
  ChevronRight,
  Lock,
  RefreshCw,
  Trash2,
} from "lucide-react";

// ADMIN_PASSWORD is NOT stored here — it lives in Supabase Vault as a secret
// and is verified server-side by the admin-stats edge function only.
const SESSION_KEY = "furnish_admin_auth";
const POLL_MS = 30_000; // background refresh every 30 s

type UserStat = {
  user_id: string;
  user_email: string;
  user_created_at: string;
  project_count: number;
  product_count: number;
};

type ProjectStat = {
  project_id: string;
  project_name: string;
  project_created_at: string;
  user_id: string;
  product_count: number;
};

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [users, setUsers] = useState<UserStat[]>([]);
  const [projects, setProjects] = useState<ProjectStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<UserStat | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // The verified password is kept only in JS heap memory — never written to
  // the DOM, localStorage, or sessionStorage. Polling uses it for re-fetches.
  const passwordRef = useRef<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session flag from sessionStorage after mount (SSR-safe).
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") setAuthenticated(true);
  }, []);

  /* ── Helpers ────────────────────────────────────────────────────────── */
  const normaliseUsers = (rows: UserStat[]) =>
    rows.map((u) => ({
      ...u,
      project_count: Number(u.project_count),
      product_count: Number(u.product_count),
    }));

  const normaliseProjects = (rows: ProjectStat[]) =>
    rows.map((p) => ({ ...p, product_count: Number(p.product_count) }));

  /* ── Password form ──────────────────────────────────────────────────── */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError(false);

    // Password is sent to the edge function and verified server-side.
    // The function returns { users, projects } on success or status 401 on failure.
    const { data, error } = await supabase.functions.invoke("admin-stats", {
      body: { password },
    });

    if (error || data?.error) {
      setPasswordError(true);
      setPassword("");
      setLoading(false);
      return;
    }

    // Correct password — store in ref (heap only) and populate dashboard.
    passwordRef.current = password;
    sessionStorage.setItem(SESSION_KEY, "true");
    setAuthenticated(true);
    setPasswordError(false);
    if (data.users) setUsers(normaliseUsers(data.users as UserStat[]));
    if (data.projects) setProjects(normaliseProjects(data.projects as ProjectStat[]));
    setLastUpdated(new Date());
    setLoading(false);
  };

  /* ── Data re-fetch (polling + manual refresh) ───────────────────────── */
  const fetchData = async (silent = false) => {
    if (!passwordRef.current) return; // page reloaded — ref is empty, skip
    if (silent) setRefreshing(true);
    else setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase.functions.invoke("admin-stats", {
      body: { password: passwordRef.current },
    });

    if (error || data?.error) {
      setFetchError((error as { message?: string } | null)?.message ?? data?.error ?? "Unknown error");
    } else {
      if (data.users) setUsers(normaliseUsers(data.users as UserStat[]));
      if (data.projects) setProjects(normaliseProjects(data.projects as ProjectStat[]));
      setLastUpdated(new Date());
    }

    if (silent) setRefreshing(false);
    else setLoading(false);
  };

  /* ── Start polling once authenticated with a live passwordRef ───────── */
  useEffect(() => {
    if (!authenticated || !passwordRef.current) return;
    pollRef.current = setInterval(() => fetchData(true), POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [authenticated]);

  /* ── Sign out ───────────────────────────────────────────────────────── */
  const handleSignOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    passwordRef.current = "";
    if (pollRef.current) clearInterval(pollRef.current);
    setAuthenticated(false);
    setPassword("");
    setUsers([]);
    setProjects([]);
  };

  /* ── Delete user ────────────────────────────────────────────────────── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    const { data, error } = await supabase.functions.invoke("admin-stats", {
      body: { password: passwordRef.current, action: "deleteUser", userId: deleteTarget.user_id },
    });

    if (error || data?.error) {
      setDeleteError((error as { message?: string } | null)?.message ?? data?.error ?? "Failed to delete user");
      setDeleting(false);
      return;
    }

    // Remove user and their projects from local state optimistically
    setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget.user_id));
    setProjects((prev) => prev.filter((p) => p.user_id !== deleteTarget.user_id));
    if (expandedUser === deleteTarget.user_id) setExpandedUser(null);
    setDeleteTarget(null);
    setDeleting(false);
  };

  /* ── Password gate ──────────────────────────────────────────────────── */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-xs px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary mb-4">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <h1 className="text-base font-semibold text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the admin password to continue
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Password"
              className={`w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-2.5 rounded-lg text-sm outline-none transition-shadow ${
                passwordError
                  ? "ring-2 ring-destructive"
                  : "focus:ring-2 focus:ring-ring/20"
              }`}
              autoFocus
            />
            {passwordError && (
              <p className="text-xs text-destructive">Incorrect password. Try again.</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ──────────────────────────────────────────────────────── */
  const totalProjects = users.reduce((s, u) => s + u.project_count, 0);
  const totalProducts = users.reduce((s, u) => s + u.product_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-foreground">Admin</h1>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              title="Refresh"
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ── Loading ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : fetchError ? (
          /* ── Error ───────────────────────────────────────────────── */
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-5 py-4 text-sm text-destructive space-y-2">
            <p className="font-medium">Failed to load admin data</p>
            <p className="text-xs opacity-80">{fetchError}</p>
            <button
              onClick={() => fetchData()}
              className="text-xs underline opacity-80 hover:opacity-100"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* ── Summary cards ────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg px-5 py-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs">Accounts</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{users.length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg px-5 py-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span className="text-xs">Projects</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{totalProjects}</p>
              </div>
              <div className="bg-card border border-border rounded-lg px-5 py-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-xs">Saved products</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{totalProducts}</p>
              </div>
            </div>

            {/* ── Users table ──────────────────────────────────────── */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">
                All accounts{" "}
                <span className="text-muted-foreground font-normal">({users.length})</span>
              </h2>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                        Email
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                        Joined
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                        Projects
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                        Products
                      </th>
                      <th className="w-8 px-3 py-3" />
                      <th className="w-8 px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-muted-foreground text-sm"
                        >
                          No accounts found
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const userProjects = projects.filter(
                          (p) => p.user_id === u.user_id
                        );
                        const expanded = expandedUser === u.user_id;
                        const hasProjects = userProjects.length > 0;

                        return (
                          <React.Fragment key={u.user_id}>
                            {/* ── User row ─────────────────────────── */}
                            <tr
                              className={`border-b border-border transition-colors ${
                                hasProjects
                                  ? "hover:bg-secondary/20 cursor-pointer"
                                  : ""
                              }`}
                              onClick={() =>
                                hasProjects &&
                                setExpandedUser(expanded ? null : u.user_id)
                              }
                            >
                              <td className="px-5 py-3.5 font-medium text-card-foreground">
                                {u.user_email}
                              </td>
                              <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                                {new Date(u.user_created_at).toLocaleDateString(
                                  "en-GB",
                                  { day: "2-digit", month: "short", year: "numeric" }
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right text-card-foreground tabular-nums">
                                {u.project_count}
                              </td>
                              <td className="px-5 py-3.5 text-right text-card-foreground tabular-nums">
                                {u.product_count}
                              </td>
                              <td className="px-3 py-3.5 text-muted-foreground">
                                {hasProjects &&
                                  (expanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  ))}
                              </td>
                              <td
                                className="px-3 py-3.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setDeleteTarget(u);
                                    setDeleteError(null);
                                  }}
                                  title="Delete user"
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>

                            {/* ── Per-project sub-rows ─────────────── */}
                            {expanded &&
                              userProjects.map((proj) => (
                                <tr
                                  key={proj.project_id}
                                  className="border-b border-border bg-secondary/10"
                                >
                                  <td
                                    className="pl-12 pr-5 py-2.5 text-muted-foreground"
                                    colSpan={2}
                                  >
                                    <div className="flex items-center gap-2">
                                      <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                                      <span className="text-xs">{proj.project_name}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
                                    {new Date(proj.project_created_at).toLocaleDateString(
                                      "en-GB",
                                      { day: "2-digit", month: "short", year: "numeric" }
                                    )}
                                  </td>
                                  <td className="px-5 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
                                    {proj.product_count} product
                                    {proj.product_count !== 1 ? "s" : ""}
                                  </td>
                                  <td className="px-3 py-2.5" />
                                  <td className="px-3 py-2.5" />
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Delete confirmation modal ──────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative z-10 bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Delete account</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This will permanently delete{" "}
                <span className="font-medium text-foreground">{deleteTarget.user_email}</span>{" "}
                and all their projects, rooms, and saved products. This cannot be undone.
              </p>
            </div>

            {deleteError && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs rounded-lg bg-destructive text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
