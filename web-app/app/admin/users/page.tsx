"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { toast } from "sonner";

import { MOCK_USERS, type MockUser, type PlatformUserRole } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_FILTERS: { value: PlatformUserRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "All roles" },
  { value: "SELLER", label: "Seller" },
  { value: "BUYER", label: "Buyer" },
  { value: "VERIFIER", label: "Verifier" },
  { value: "ADMIN", label: "Admin" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [role, setRole] = useState<PlatformUserRole | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = role === "ALL" || u.role === role;
      const matchesQuery =
        query.trim() === "" ||
        u.display_name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      return matchesRole && matchesQuery;
    });
  }, [users, role, query]);

  function toggleActive(id: number) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u))
    );
    // TODO: PATCH /api/accounts/users/{id}/ once the admin user-management
    // endpoint is exercised from the frontend.
    toast.info("Account status updated (not yet persisted).");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch size={15} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-2" />
          <Input
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as PlatformUserRole | "ALL")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border-muted bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-border-muted hover:bg-transparent">
              <TableHead className="pl-5">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="pr-5 text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} className="border-border-muted">
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback>{user.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-heading">{user.display_name}</p>
                      <p className="text-xs text-muted-2">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-body">{user.role}</TableCell>
                <TableCell className="text-body">{user.created_at}</TableCell>
                <TableCell className="pr-5 text-right">
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={() => toggleActive(user.id)}
                    aria-label={user.is_active ? "Deactivate account" : "Activate account"}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="border-border-muted hover:bg-transparent">
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-2">
                  No users match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
