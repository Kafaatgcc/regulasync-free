import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

const roles = ["all", "super_admin", "company_admin", "compliance_manager", "department_user", "auditor", "user", "admin"] as const;
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
export default function SuperAdminUsers({ organizations }: { organizations: { id: number; name: string }[] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<typeof roles[number]>("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [organization, setOrganization] = useState<string>("all");
  const [page, setPage] = useState(1);
  useEffect(() => { const timer = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 250); return () => clearTimeout(timer); }, [search]);
  const query = trpc.superAdmin.searchUsers.useQuery({ search: debouncedSearch, role, status,
    organization: organization === "all" || organization === "unassigned" ? organization : Number(organization), page, pageSize: 25 }, { retry: false });
  const data = query.data;
  const activeFilters = !!search || role !== "all" || status !== "all" || organization !== "all";
  const reset = () => { setSearch(""); setDebouncedSearch(""); setRole("all"); setStatus("all"); setOrganization("all"); setPage(1); };
  const selectClass = "h-10 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm";
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1.4fr_auto]">
      <div><Label htmlFor="admin-user-search">Search user records</Label><div className="relative mt-1">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input id="admin-user-search" placeholder="Name, email, user ID or organisation" maxLength={120} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div></div>
      <div><Label htmlFor="admin-user-role">Role</Label><select id="admin-user-role" className={`${selectClass} mt-1`} value={role} onChange={e => { setRole(e.target.value as typeof role); setPage(1); }}>
        {roles.map(value => <option value={value} key={value}>{value === "all" ? "All roles" : label(value)}</option>)}
      </select></div>
      <div><Label htmlFor="admin-user-status">Status</Label><select id="admin-user-status" className={`${selectClass} mt-1`} value={status} onChange={e => { setStatus(e.target.value as typeof status); setPage(1); }}>
        <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
      </select></div>
      <div><Label htmlFor="admin-user-organization">Organisation</Label><select id="admin-user-organization" className={`${selectClass} mt-1`} value={organization} onChange={e => { setOrganization(e.target.value); setPage(1); }}>
        <option value="all">All organisations</option><option value="unassigned">Unassigned</option>
        {organizations.map(org => <option key={org.id} value={String(org.id)}>{org.name}</option>)}
      </select></div>
      <Button variant="outline" className="self-end gap-2" disabled={!activeFilters} onClick={reset}><RotateCcw className="w-4 h-4" />Reset</Button>
    </div>
    <div aria-live="polite" className="text-sm text-muted-foreground">
      {query.isFetching ? "Searching user records…" : `${data?.total ?? 0} matching ${(data?.total ?? 0) === 1 ? "user" : "users"}`}
    </div>
    {query.error ? <div role="alert" className="rounded-lg border p-4 text-sm">
      <p>Unable to load user records. {query.error.message}</p><Button variant="outline" size="sm" onClick={() => void query.refetch()} className="mt-2">Retry</Button>
    </div> : <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm" aria-label="Super Admin user records">
        <thead className="bg-muted/40"><tr className="text-left"><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Organisation</th><th className="p-3">Status</th><th className="p-3">Last sign-in</th></tr></thead>
        <tbody>{data?.records.map(user => <tr key={user.id} className="border-t hover:bg-muted/20">
          <td className="p-3"><div className="font-medium">{user.name || "Unnamed user"}</div><div className="text-xs text-muted-foreground">{user.email || "No email"}</div><div className="text-[10px] text-muted-foreground">ID: {user.id}</div></td>
          <td className="p-3"><Badge variant="outline" className="whitespace-nowrap">{label(user.role)}</Badge></td>
          <td className="p-3 text-xs">{user.organizationName || "Unassigned"}</td>
          <td className="p-3"><Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge></td>
          <td className="p-3 text-xs whitespace-nowrap">{user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString() : "—"}</td>
        </tr>)}
          {!query.isFetching && !data?.records.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users match your search or filters. {activeFilters && <button className="underline" onClick={reset}>Clear filters</button>}</td></tr>}
          {query.isLoading && <tr><td colSpan={5} className="p-8 text-center">Loading user records…</td></tr>}
        </tbody>
      </table>
    </div>}
    {!!data?.total && <div className="flex items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">Page {data.page} of {Math.ceil(data.total / data.pageSize)} · {data.total} records</p>
      <div className="flex gap-2"><Button variant="outline" size="sm" aria-label="Previous user results" disabled={query.isFetching || data.page <= 1} onClick={() => setPage(data.page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
        <Button variant="outline" size="sm" aria-label="Next user results" disabled={query.isFetching || data.page * data.pageSize >= data.total} onClick={() => setPage(data.page + 1)}><ChevronRight className="w-4 h-4" /></Button></div>
    </div>}
  </div>;
}
