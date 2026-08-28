"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchUsersAction } from "../actions/search-users.action";
import { updateUserRoleAction } from "../actions/user.actions";

type SearchResult = { id: string; name: string; email: string; role: string };

export function PromoteUserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(async () => {
      const result = await searchUsersAction(query);
      if (result.success) {
        setResults(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handlePromote(userId: string, role: string) {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, role);
      if (result.success) {
        toast.success("Role updated. Refresh to see them in the staff list.");
        setResults((prev) => prev.map((r) => (r.id === userId ? { ...r, role } : r)));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find & promote a user</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Search
          </Button>
        </form>

        {results.length > 0 && (
          <div className="divide-y divide-border rounded-md border border-border">
            {results.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.email} · currently {user.role}
                  </p>
                </div>
                {user.role === "CUSTOMER" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePromote(user.id, "EDITOR")}
                    disabled={isPending}
                  >
                    <UserPlus /> Make Editor
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Already staff</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
