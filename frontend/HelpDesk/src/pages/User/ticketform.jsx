import { CreateForm } from "@/components/createform"
export default function TicketForm() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10" >
      <div className="w-full max-w-lg">
        <CreateForm />
      </div>
    </div>
  )
}

