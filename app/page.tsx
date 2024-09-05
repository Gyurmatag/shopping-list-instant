'use client'

import { useState } from 'react'
import { id, init, tx } from '@instantdb/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react'

const db = init<{
  items: {
    id: string;
    name: string;
    quantity: number;
  };
}>({
  appId: "71225d7c-7cf9-4436-a297-3e0dcc6f4018",
});

export default function Page() {
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; quantity: number } | null>(null)

  const { data, isLoading, error } = db.useQuery({
    items: {},
  });

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName || newItemQuantity <= 0) return;

    db.transact([
      tx.items[id()].update({
        name: newItemName,
        quantity: newItemQuantity,
      }),
    ]);

    setNewItemName('')
    setNewItemQuantity(1)
  }

  async function handleRemoveItem(itemId: string) {
    db.transact([tx.items[itemId].delete()]);
  }

  async function handleEditItem(updatedItem: { id: string; name: string; quantity: number }) {
    if (!updatedItem.name || updatedItem.quantity <= 0) return;

    db.transact([
      tx.items[updatedItem.id].update({
        name: updatedItem.name,
        quantity: updatedItem.quantity,
      }),
    ]);

    setEditingItem(null)
  }

  if (error) return <p className="p-4 flex items-center">Oops, something went wrong</p>;

  return (
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Shopping List</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                    id="itemName"
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name"
                    required
                />
              </div>
              <div>
                <Label htmlFor="itemQuantity">Quantity</Label>
                <Input
                    id="itemQuantity"
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
                    min="1"
                    required
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </form>
            {isLoading ? (
                <p className="italic text-gray-700">Loading...</p>
            ) : data?.items.length ? (
                <ul className="space-y-4">
                  {data.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between bg-secondary p-3 rounded-md">
                        {editingItem?.id === item.id ? (
                            <div className="flex items-center space-x-2 w-full">
                              <Input
                                  type="text"
                                  value={editingItem.name}
                                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                  className="flex-grow"
                              />
                              <Input
                                  type="number"
                                  value={editingItem.quantity}
                                  onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                                  className="w-20"
                                  min="1"
                              />
                              <Button onClick={() => handleEditItem(editingItem)} size="icon">
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => setEditingItem(null)} variant="outline" size="icon">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                        ) : (
                            <>
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                              <div className="space-x-2">
                                <Button onClick={() => setEditingItem(item)} variant="outline" size="icon">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button onClick={() => handleRemoveItem(item.id)} variant="destructive" size="icon">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                        )}
                      </li>
                  ))}
                </ul>
            ) : (
                <p className="italic text-gray-700">No items in the shopping list!</p>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Total items: {data?.items.length || 0}</p>
          </CardFooter>
        </Card>
      </div>
  )
}