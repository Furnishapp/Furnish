"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  User,
  Briefcase,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

interface Person {
  id: string;
  name: string;
  role: string;
  contact: string;
}

interface PeopleModeProps {
  projectId: string;
}

const ROLE_OPTIONS = ["Client", "Architect", "Contractor", "Supplier", "Consultant", "Other"];

async function loadPeopleFromDb(projectId: string): Promise<{ people: Person[]; clientName: string; clientContact: string }> {
  const { data } = await supabase
    .from("projects")
    .select("description")
    .eq("id", projectId)
    .single();

  if (!data?.description) return { people: [], clientName: "", clientContact: "" };

  try {
    const parsed = JSON.parse(data.description);
    const b = parsed.brief ?? {};
    return {
      people: (b.people as Person[]) ?? [],
      clientName: b.clientName ?? "",
      clientContact: b.clientContact ?? "",
    };
  } catch {
    return { people: [], clientName: "", clientContact: "" };
  }
}

async function savePeopleToDb(projectId: string, people: Person[]) {
  const { data } = await supabase
    .from("projects")
    .select("description")
    .eq("id", projectId)
    .single();

  let current: Record<string, unknown> = {};
  if (data?.description) {
    try { current = JSON.parse(data.description); } catch {}
  }

  const merged = { ...(current.brief as object ?? {}), people };
  await supabase
    .from("projects")
    .update({ description: JSON.stringify({ ...current, brief: merged }) })
    .eq("id", projectId);
}

const roleIcon = (role: string) => {
  if (role.toLowerCase() === "client") return <User className="w-3.5 h-3.5" />;
  return <Briefcase className="w-3.5 h-3.5" />;
};

const roleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "client": return "bg-blue-50 text-blue-700 border-blue-200";
    case "architect": return "bg-violet-50 text-violet-700 border-violet-200";
    case "contractor": return "bg-orange-50 text-orange-700 border-orange-200";
    case "supplier": return "bg-green-50 text-green-700 border-green-200";
    case "consultant": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-secondary text-foreground border-border";
  }
};

export default function PeopleMode({ projectId }: PeopleModeProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);

  // Add person form state
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Client");
  const [newContact, setNewContact] = useState("");

  useEffect(() => {
    async function load() {
      const { people: existing, clientName, clientContact } = await loadPeopleFromDb(projectId);

      if (existing.length > 0) {
        setPeople(existing);
      } else if (clientName) {
        // Migrate legacy client info
        const migrated: Person[] = [
          {
            id: crypto.randomUUID(),
            name: clientName,
            role: "Client",
            contact: clientContact,
          },
        ];
        setPeople(migrated);
        await savePeopleToDb(projectId, migrated);
      }

      setLoading(false);
    }
    load();
  }, [projectId]);

  const save = useCallback(async (updated: Person[]) => {
    setSaving(true);
    await savePeopleToDb(projectId, updated);
    setSaving(false);
  }, [projectId]);

  const addPerson = async () => {
    if (!newName.trim()) return;
    const person: Person = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      role: newRole,
      contact: newContact.trim(),
    };
    const updated = [...people, person];
    setPeople(updated);
    setNewName("");
    setNewRole("Client");
    setNewContact("");
    setShowForm(false);
    await save(updated);
  };

  const removePerson = async (id: string) => {
    const updated = people.filter((p) => p.id !== id);
    setPeople(updated);
    await save(updated);
  };

  const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const isPhone = (s: string) => /^[\d\s\+\-\(\)]{6,}$/.test(s);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const grouped = ROLE_OPTIONS.reduce<Record<string, Person[]>>((acc, role) => {
    const group = people.filter((p) => p.role === role);
    if (group.length) acc[role] = group;
    return acc;
  }, {});
  const others = people.filter((p) => !ROLE_OPTIONS.includes(p.role));
  if (others.length) grouped["Other"] = [...(grouped["Other"] ?? []), ...others];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header bar */}
      <div className="shrink-0 px-6 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">People</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {people.length === 0 ? "No contacts yet" : `${people.length} contact${people.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving
            </span>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add person
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="shrink-0 mx-6 mt-4 p-4 rounded-xl bg-secondary/60 border border-border/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                Name *
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPerson()}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Full name…"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1">
              Contact (email or phone)
            </label>
            <input
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPerson()}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="email@example.com or +1 234 567 8900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addPerson}
              disabled={!newName.trim()}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* People list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No contacts yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Add clients, architects, contractors, and other collaborators for this project.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([role, members]) => (
            <div key={role}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${roleColor(role)}`}>
                  {roleIcon(role)}
                  {role}
                </span>
                <span className="text-xs text-muted-foreground">{members.length}</span>
              </div>

              <div className="space-y-2">
                {members.map((person) => (
                  <div
                    key={person.id}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-foreground/70">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                      {person.contact && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {isEmail(person.contact) ? (
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                          ) : isPhone(person.contact) ? (
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          ) : null}
                          <p className="text-xs text-muted-foreground truncate">{person.contact}</p>
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removePerson(person.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
