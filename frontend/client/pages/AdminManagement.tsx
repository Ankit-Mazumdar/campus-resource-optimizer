import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useResources } from "@/hooks/useResources";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit2, Plus, AlertCircle } from "lucide-react";
import { Resource, ResourceType } from "@/types";

export default function AdminManagement() {
  const { user } = useAuth();
  const { resources, addResource, updateResource, deleteResource } =
    useResources();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "classroom" as ResourceType,
    description: "",
    capacity: "",
    location: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddResource = () => {
    if (!formData.name || !formData.type) {
      setMessage("Please fill in all required fields");
      return;
    }

    addResource({
      name: formData.name,
      type: formData.type,
      description: formData.description,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      location: formData.location,
    });

    setFormData({
      name: "",
      type: "classroom",
      description: "",
      capacity: "",
      location: "",
    });
    setIsAddOpen(false);
    setMessage("Resource added successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteResource = (id: string) => {
    deleteResource(id);
    setDeleteId(null);
    setMessage("Resource deleted successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "classroom":
        return "📚";
      case "equipment":
        return "🖥️";
      case "book":
        return "📖";
      case "faculty_hours":
        return "👨‍🏫";
      default:
        return "📦";
    }
  };

  // Ensure user is admin
  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">You don't have access to this page.</p>
      </div>
    );
  }

  const classrooms = filteredResources.filter((r) => r.type === "classroom");
  const equipment = filteredResources.filter((r) => r.type === "equipment");
  const books = filteredResources.filter((r) => r.type === "book");
  const faculty = filteredResources.filter((r) => r.type === "faculty_hours");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Resource Management
          </h1>
          <p className="text-slate-600 mt-2">
            Add, edit, and manage campus resources
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 flex gap-2">
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>

            {message && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-600">{message}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Resource Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Classroom A101"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="faculty_hours">Faculty Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Building A, Floor 1"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <Button
                onClick={handleAddResource}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Add Resource
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex gap-3 animate-slide-in-down">
          <div className="text-green-600">✓</div>
          <p className="text-sm text-green-600 font-medium">{message}</p>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="classrooms" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="classrooms">
            Classrooms ({classrooms.length})
          </TabsTrigger>
          <TabsTrigger value="equipment">
            Equipment ({equipment.length})
          </TabsTrigger>
          <TabsTrigger value="books">Books ({books.length})</TabsTrigger>
          <TabsTrigger value="faculty">Faculty ({faculty.length})</TabsTrigger>
        </TabsList>

        {/* Classrooms Tab */}
        <TabsContent value="classrooms" className="space-y-4">
          {classrooms.length > 0 ? (
            <div className="grid gap-4">
              {classrooms.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  icon={getResourceIcon(resource.type)}
                  onDelete={() => setDeleteId(resource.id)}
                  deleteId={deleteId}
                  onConfirmDelete={handleDeleteResource}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center shadow-soft">
              <p className="text-slate-600">No classrooms found</p>
            </Card>
          )}
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          {equipment.length > 0 ? (
            <div className="grid gap-4">
              {equipment.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  icon={getResourceIcon(resource.type)}
                  onDelete={() => setDeleteId(resource.id)}
                  deleteId={deleteId}
                  onConfirmDelete={handleDeleteResource}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center shadow-soft">
              <p className="text-slate-600">No equipment found</p>
            </Card>
          )}
        </TabsContent>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          {books.length > 0 ? (
            <div className="grid gap-4">
              {books.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  icon={getResourceIcon(resource.type)}
                  onDelete={() => setDeleteId(resource.id)}
                  deleteId={deleteId}
                  onConfirmDelete={handleDeleteResource}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center shadow-soft">
              <p className="text-slate-600">No books found</p>
            </Card>
          )}
        </TabsContent>

        {/* Faculty Tab */}
        <TabsContent value="faculty" className="space-y-4">
          {faculty.length > 0 ? (
            <div className="grid gap-4">
              {faculty.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  icon={getResourceIcon(resource.type)}
                  onDelete={() => setDeleteId(resource.id)}
                  deleteId={deleteId}
                  onConfirmDelete={handleDeleteResource}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center shadow-soft">
              <p className="text-slate-600">No faculty found</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourceCard({
  resource,
  icon,
  onDelete,
  deleteId,
  onConfirmDelete,
}: {
  resource: Resource;
  icon: string;
  onDelete: () => void;
  deleteId: string | null;
  onConfirmDelete: (id: string) => void;
}) {
  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <span className="text-3xl">{icon}</span>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">{resource.name}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {resource.description}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
              {resource.location && <span>📍 {resource.location}</span>}
              {resource.capacity && (
                <span>👥 Capacity: {resource.capacity}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-200">
            <Edit2 className="w-4 h-4" />
          </Button>
          {deleteId === resource.id ? (
            <Dialog open={deleteId === resource.id} onOpenChange={() => {}}>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600"
                  onClick={() => onConfirmDelete(resource.id)}
                >
                  Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete()}>
                  Cancel
                </Button>
              </div>
            </Dialog>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
