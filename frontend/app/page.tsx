"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  id: number;
  email: string;
  name: string;
};

type Generation = {
  _id: string;
  userId: number;
  prompt: string;
  result: string;
  createdAt: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [generationsLoading, setGenerationsLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [generationsError, setGenerationsError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchUsers = () => {
    console.log("API_URL", API_URL);

    setUsersLoading(true);
    fetch(`${API_URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setUsersLoading(false);
      })
      .catch((error) => {
        setUsersError(error.message);
        setUsersLoading(false);
      });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and close dialog
      setNewUserName("");
      setNewUserEmail("");
      setIsDialogOpen(false);

      // Refresh users list
      fetchUsers();
    } catch (error) {
      alert("Erreur lors de la création de l'utilisateur");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    // Fetch users
    fetchUsers();

    // Fetch generations
    fetch(`${API_URL}/generation`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setGenerations(data);
        setGenerationsLoading(false);
      })
      .catch((error) => {
        setGenerationsError(error.message);
        setGenerationsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          🚀 API Gateway Test
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Users API */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                👥 Users API
                <span className="text-sm font-normal text-gray-500">
                  (via /users)
                </span>
              </h2>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">+ Ajouter</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateUser}>
                    <DialogHeader>
                      <DialogTitle>Ajouter un utilisateur</DialogTitle>
                      <DialogDescription>
                        Remplissez les champs pour créer un nouvel utilisateur.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isCreating}
                      >
                        Annuler
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? "Création..." : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {usersLoading && (
              <div className="text-gray-600 dark:text-gray-400">
                Loading users...
              </div>
            )}

            {usersError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                <p className="font-bold">Error:</p>
                <p>{usersError}</p>
              </div>
            )}

            {!usersLoading && !usersError && (
              <>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  ✅ {users.length} user(s) found
                </p>
                {users.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          ID: {user.id}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-4xl mb-2">👤</p>
                    <p className="font-medium">Aucun utilisateur trouvé</p>
                    <p className="text-sm mt-1">La base de données est vide</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Generations API */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              ✨ Generations API
              <span className="text-sm font-normal text-gray-500">
                (via /generation)
              </span>
            </h2>

            {generationsLoading && (
              <div className="text-gray-600 dark:text-gray-400">
                Loading generations...
              </div>
            )}

            {generationsError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                <p className="font-bold">Error:</p>
                <p>{generationsError}</p>
              </div>
            )}

            {!generationsLoading && !generationsError && (
              <>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  ✅ {generations.length} generation(s) found
                </p>
                {generations.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generations.map((gen) => (
                      <div
                        key={gen._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                          {gen.prompt}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {gen.result}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          User ID: {gen.userId} •{" "}
                          {new Date(gen.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-4xl mb-2">✨</p>
                    <p className="font-medium">Aucune génération trouvée</p>
                    <p className="text-sm mt-1">La base de données est vide</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>ℹ️ Info:</strong> Cette page teste la communication entre le
            frontend et les microservices via l&apos;API Gateway.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
            API Gateway URL: {API_URL}
          </p>
        </div>
      </div>
    </div>
  );
}
