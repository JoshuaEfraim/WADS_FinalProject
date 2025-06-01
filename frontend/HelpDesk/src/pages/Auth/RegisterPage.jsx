import React from 'react'
import { RegistrationForm } from '@/components/registration-form'

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-[500px]">
        <RegistrationForm/>
      </div>
    </div>
  )
}


