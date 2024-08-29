import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Separator } from '@radix-ui/react-separator'
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { SignInFlow } from '../types'
import { TriangleAlert } from 'lucide-react'
import { useAuthActions } from '@convex-dev/auth/react'

interface SignUpCardProps {
  setState: (state: SignInFlow) => void;
}

export const SignUpCard = ({setState}: SignUpCardProps) => {
  const { signIn } = useAuthActions();

  const [name, setName] = useState<string>('');
  const  [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    signIn('password', {name, email, password, flow: 'signUp'})
    .catch((error) => {
      setError("Invalid email or password");
    })
      .finally(() => {
        setPending(false);
      })
  }

  const onProviderSignUp = (value: 'github' | 'google') => {
    setPending(true);
    signIn(value)
      .finally(() => {
        setPending(false);
      })
  }

  return (
    <Card className='w-full h-full p-8'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle>
          Sign Up to Continue
        </CardTitle>
        <CardDescription>
          Use your email or another service to Continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
          <TriangleAlert className='size-4'/>
          <p>{error}</p>
        </div>
      )}
      <CardContent className='space-y-5 px-0 pb-0'>
        <form onSubmit={onPasswordSignUp} className='space-y-2.5'>
        <Input 
          disabled={pending}
          value={name}
          onChange={(e) => {setName(e.target.value)}}
          placeholder='Full Name'
          required={true}
          />
          <Input 
          disabled={pending}
          value={email}
          onChange={(e) => {setEmail(e.target.value)}}
          placeholder='Email'
          type='email'
          required={true}
          />
          <Input 
          disabled={pending}
          value={password}
          onChange={(e) => {setPassword(e.target.value)}}
          placeholder='Password'
          type='password'
          required={true}
          />
          <Input 
          disabled={pending}
          value={confirmPassword}
          onChange={(e) => {setConfirmPassword(e.target.value)}}
          placeholder='Confirm Password'
          type='password'
          required={true}
          />
          <Button type='submit' size={"lg"} disabled={pending} className='w-full'>
            Continue
          </Button>
          <Separator/>
          <div className='flex flex-col gap-y-2.5'>
          <Button
              disabled={pending}
              onClick={() => {onProviderSignUp('google')}}
              variant='outline'
              size='lg'
              className='w-full relative'>
                <FcGoogle className='size-5 absolute top-2.5 left-2.5'/>
              Continue with Google
            </Button>
            <Button
              disabled={pending}
              onClick={() => {onProviderSignUp('github')}}
              variant='outline'
              size='lg'
              className='w-full relative'>
                <FaGithub className='size-5 absolute top-3 left-2.5'/>
              Continue with Github
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            Already have an account? <span onClick={() => setState("signIn")} className='text-sky-700 hower:underline cursor-pointer'>
              Sign In
            </span>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
