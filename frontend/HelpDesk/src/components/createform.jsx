import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import ticketService from '@/services/ticket';

export function CreateForm({ className, ...props }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPriorityError, setShowPriorityError] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePriorityChange = (value) => {
    setShowPriorityError(false);
    setFormData(prev => ({
      ...prev,
      priority: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show priority error if not selected
    if (!formData.priority) {
      setShowPriorityError(true);
    }

    // Validate required fields
    if (!formData.subject || !formData.description || !formData.priority) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subject, description, and priority are required fields"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await ticketService.createTicket(formData);

      toast({
        title: "Success",
        description: response.message || "Ticket created successfully!"
      });

      // Navigate to tickets list
      navigate('/user');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create ticket"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
          <CardDescription>
            Please provide details about your issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of the issue"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of your issue"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="min-h-[150px]"
                />
              </div>
              <div className="grid gap-3">
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={handlePriorityChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
                {showPriorityError && (
                  <span className="text-sm font-medium text-red-500">
                    Please choose a priority level
                  </span>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                onSubmit={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateForm;